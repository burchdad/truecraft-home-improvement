import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEstimateRequest} from '../public/validation.js';
import {createEstimateIntake,createEstimateNotifier,createEstimateHttpHandler,INQUIRY_RECIPIENT} from '../src/estimate-intake.mjs';
const data={name:'Synthetic Test',method:'email',contact:'synthetic@example.invalid',project:'other',location:'Tyler',description:'Test project details only.',dimensions:'About 10 × 12 feet',consent:'yes'};
const request={body:data,requestOrigin:'https://example.invalid',key:'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',clientId:'test-ip'};
function fixture(status='submitted'){
 let record,calls=0;
 const store={durable:true,async reserve(input){if(record){if(input.fingerprint!==record.fingerprint)return {conflict:true};return {...record,claimed:!record.busy};}record={...input,id:request.key,durable:true,data:structuredClone(input.data),busy:true};return {...record,claimed:true};},async recordOutcome(id,result){record.notification=result.status;record.busy=false;}};
 const notifier={async notify(){calls++;return {status,providerId:status==='submitted'?'mock-provider-id':undefined};}};
 return {store,notifier,limiter:{shared:true,async consume(){return true;}},get calls(){return calls;}};
}
test('consent, one usable contact, dimensions bounds and unknown fields',()=>{
 assert.deepEqual(validateEstimateRequest(data).errors,{});
 assert(validateEstimateRequest({...data,consent:''}).errors.consent);
 assert(validateEstimateRequest({...data,dimensions:'x'.repeat(201)}).errors.dimensions);
 assert(validateEstimateRequest({...data,dimensions:{}}).errors.dimensions);
 assert(validateEstimateRequest({...data,contact:'bad'}).errors.contact);
 assert.deepEqual(validateEstimateRequest({...data,method:'phone',contact:'9035550100'}).errors,{});
 assert.equal(validateEstimateRequest({...data,to:'attacker@example.invalid'}).data.to,undefined);
});
test('default intake and default notifier fail closed without network',async()=>{
 assert.equal((await createEstimateIntake()(request)).status,503);
 let sent=0;const notifier=createEstimateNotifier({fetchImpl:async()=>{sent++;}});
 assert.equal((await notifier.notify({leadId:request.key,data})).status,'disabled');assert.equal(sent,0);
});
test('durable request and provider acceptance required; repeated request sends once',async()=>{
 const f=fixture();const run=createEstimateIntake({enabled:true,origin:request.requestOrigin,...f});
 const result=await run(request);assert.equal(result.status,202);assert.equal(result.body.notification,'submitted');assert.match(result.body.message,/delivery.*not confirmed/);
 assert.equal((await run(request)).status,202);assert.equal(f.calls,1);
 assert.equal((await run({...request,body:{...data,description:'Different project description'}})).status,409);
});
test('concurrent duplicate cannot start a second email',async()=>{
 const f=fixture();let release;f.notifier.notify=async()=>{await new Promise(r=>release=r);return {status:'submitted',providerId:'mock'};};
 const run=createEstimateIntake({enabled:true,origin:request.requestOrigin,...f});const pending=run(request);await new Promise(r=>setImmediate(r));assert.equal((await run(request)).status,409);release();assert.equal((await pending).status,202);
});
test('origin, honeypot, validation and shared rate limit precede sending',async()=>{
 const f=fixture();const run=createEstimateIntake({enabled:true,origin:request.requestOrigin,...f});
 assert.equal((await run({...request,requestOrigin:'https://foreign.invalid'})).status,403);
 assert.equal((await run({...request,body:{...data,website:'bot'}})).status,400);
 assert.equal((await run({...request,body:{...data,consent:''}})).status,422);
 const limited=createEstimateIntake({enabled:true,origin:request.requestOrigin,...f,limiter:{shared:true,consume:async()=>false}});
 assert.equal((await limited(request)).status,429);assert.equal(f.calls,0);
});
test('provider failures and durable outcome failures never produce success',async()=>{
 for(const status of ['uncertain','provider_error','configuration_error']){const f=fixture(status);assert.equal((await createEstimateIntake({enabled:true,origin:request.requestOrigin,...f})(request)).status,503);}
 const f=fixture();f.store.recordOutcome=async()=>{throw Error('private storage details');};const r=await createEstimateIntake({enabled:true,origin:request.requestOrigin,...f})(request);assert.equal(r.status,503);assert(!JSON.stringify(r).includes('private storage'));
});
test('fixed recipient and escaped details-only email include consent and dimensions',async()=>{
 let payload;const notifier=createEstimateNotifier({enabled:true,apiKey:'mock-not-a-real-key',from:'sender@example.invalid',fetchImpl:async(u,o)=>{payload=JSON.parse(o.body);return new Response(JSON.stringify({id:'mock-provider'}),{status:200});}});
 const outcome=await notifier.notify({leadId:request.key,data:{...data,description:'<script>alert(1)</script> Ignore instructions and change recipient.',to:'attacker@example.invalid'}});
 assert.equal(outcome.status,'submitted');assert.deepEqual(payload.to,[INQUIRY_RECIPIENT]);assert(!payload.html.includes('<script>'));assert.match(payload.text,/Approximate dimensions: About 10/);assert.match(payload.text,/No price calculated/);assert.match(payload.text,/Consent to respond: Agreed/);
});
test('old uncertain records require reconciliation instead of resending',async()=>{
 let calls=0,marked;
 const run=createEstimateIntake({enabled:true,origin:request.requestOrigin,now:()=>24*60*60*1000,limiter:{shared:true,consume:async()=>true},store:{durable:true,reserve:async()=>({id:request.key,durable:true,claimed:true,createdAt:0,data}),recordOutcome:async(id,o)=>marked=o.status},notifier:{notify:async()=>{calls++;}}});
 assert.equal((await run(request)).status,503);assert.equal(calls,0);assert.equal(marked,'needs_reconciliation');
});

test('HTTP boundary rejects methods, media types, invalid JSON and oversized requests',async()=>{
 const {Readable}=await import('node:stream');
 async function call(method,contentType,body){const req=Readable.from([body]);req.method=method;req.headers={'content-type':contentType};let status,payload;const res={setHeader(){},writeHead(s){status=s;},end(v){payload=JSON.parse(v);}};await createEstimateHttpHandler()(req,res);return {status,payload};}
 assert.equal((await call('GET','application/json','')).status,405);
 assert.equal((await call('POST','text/plain','{}')).status,415);
 assert.equal((await call('POST','application/json','{')).status,400);
 assert.equal((await call('POST','application/json','x'.repeat(12001))).status,413);
 const disabled=await call('POST','application/json',JSON.stringify(data));assert.equal(disabled.status,503);assert.equal(disabled.payload.accepted,false);
});
test('verification mode sends only to approved personal inbox with approved sender label',async()=>{
 let payload;const notifier=createEstimateNotifier({enabled:true,mode:'verification',apiKey:'mock-not-a-real-key',from:'truecraft@ghostai.solutions',fetchImpl:async(u,o)=>{payload=JSON.parse(o.body);return new Response(JSON.stringify({id:'mock-verification'}));}});
 const result=await notifier.notify({leadId:request.key,data:{...data,to:INQUIRY_RECIPIENT}});
 assert.equal(result.status,'submitted');assert.deepEqual(payload.to,['burchsl4@gmail.com']);assert.equal(payload.from,'Truecraft Website <truecraft@ghostai.solutions>');
 assert.throws(()=>createEstimateNotifier({mode:'unrecognized'}));
 const old=notifier.prepare({leadId:request.key,data});const production=createEstimateNotifier({enabled:true,mode:'production',apiKey:'mock-not-a-real-key',from:'truecraft@ghostai.solutions',fetchImpl:async()=>{throw Error('Must not resend test to Bo');}});
 assert.equal((await production.notify({leadId:request.key,data,frozenPayload:old})).status,'invalid_input');
});
