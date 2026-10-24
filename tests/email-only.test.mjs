import test from 'node:test';import assert from 'node:assert/strict';
import {createEmailOnlyIntake,createLocalThrottle} from '../src/email-only-intake.mjs';
const body={name:'Fictional Test',method:'email',contact:'fictional@example.invalid',project:'other',location:'Tyler',description:'Clearly fictional test; no work requested.',consent:'yes'};
const request={body,requestOrigin:'https://example.invalid',clientId:'192.0.2.1'};
function setup(overrides={}){const sent=[];const run=createEmailOnlyIntake({enabled:true,origin:request.requestOrigin,verifyHuman:async()=>({isHuman:true,isBot:false}),notifier:{notify:async x=>{sent.push(x);return {status:'submitted',providerId:'mock-id'};}},...overrides});return {run,sent};}
test('email-only defaults disabled and accepts only provider-confirmed requests without storage claim',async()=>{
 assert.equal((await createEmailOnlyIntake()(request)).status,503);const f=setup();const r=await f.run(request);assert.equal(r.status,202);assert(!r.body.message.includes('recorded'));assert.equal(f.sent.length,1);
});
test('normalized payload yields same cross-instance provider key; destination mode has own key',async()=>{
 const a=setup(),b=setup(),c=setup({mode:'production'});await a.run(request);await b.run(request);await c.run(request);
 assert.equal(a.sent[0].leadId,b.sent[0].leadId);assert.notEqual(a.sent[0].leadId,c.sent[0].leadId);
});
test('missing/failed/spoofed human proof, wrong origin, honeypot and validation stop sending',async()=>{
 for(const proof of [null,{isHuman:false,isBot:true},{isHuman:true,isBot:false,bypassed:true},{isHuman:true,isBot:false,isVerifiedBot:true}]){const f=setup({verifyHuman:async()=>proof});assert.equal((await f.run(request)).status,403);assert.equal(f.sent.length,0);}
 const f=setup();assert.equal((await f.run({...request,requestOrigin:'https://foreign.invalid'})).status,403);assert.equal((await f.run({...request,body:{...body,website:'bot'}})).status,400);assert.equal((await f.run({...request,body:{...body,consent:''}})).status,422);assert.equal(f.sent.length,0);
});
test('bounded per-instance throttle rejects fourth attempt and expires without claiming shared protection',()=>{let now=0;const t=createLocalThrottle({now:()=>now,maxEntries:1});assert(t.consume('a'));assert(t.consume('a'));assert(t.consume('a'));assert(!t.consume('a'));assert(!t.consume('b'));now=60001;assert(t.consume('b'));});
test('uncertainty or provider rejection never claims saved inquiry or successful delivery',async()=>{
 for(const result of [{status:'uncertain'},{status:'provider_error'},{status:'submitted'}]){const f=setup({notifier:{notify:async()=>result}});const r=await f.run(request);assert.equal(r.status,503);assert.equal(r.body.accepted,false);assert.match(r.body.message,/not been saved/);}
 const f=setup({verifyHuman:async()=>{throw Error('private detail');}});assert(!JSON.stringify(await f.run(request)).includes('private detail'));
});
test('Vercel pre-parsed JSON body is bounded and reaches the same validation path',async()=>{
 const {createEstimateHttpHandler}=await import('../src/estimate-intake.mjs');let called=0,status;
 const handler=createEstimateHttpHandler({intake:async r=>{called++;assert.deepEqual(r.body,body);return {status:202,body:{accepted:true}};}});
 const res={writeHead:s=>status=s,end(){}};
 await handler({method:'POST',headers:{'content-type':'application/json'},body},res);assert.equal(called,1);assert.equal(status,202);
 await handler({method:'POST',headers:{'content-type':'application/json'},body:{description:'x'.repeat(13000)}},res);assert.equal(called,1);assert.equal(status,413);
});
test('production activation requires its own flag and key; verification expires and never changes recipient',async()=>{
 const {emailOnlyConfig,PUBLIC_ORIGIN}=await import('../src/email-only-config.mjs');
 const env={VERCEL_ENV:'production',TRUECRAFT_EMAIL_ONLY_VERIFICATION:'true',TRUECRAFT_EMAIL_ONLY_TEST_UNTIL:'9999999999999',TRUECRAFT_RESEND_API_KEY:'mock'};
 assert.equal(emailOnlyConfig(env).enabled,false);
 assert.deepEqual(emailOnlyConfig({...env,TRUECRAFT_EMAIL_ONLY_ENABLED:'true'}),{enabled:true,mode:'production',origin:PUBLIC_ORIGIN});
 assert.equal(emailOnlyConfig({...env,TRUECRAFT_EMAIL_ONLY_ENABLED:'true',TRUECRAFT_RESEND_API_KEY:''}).enabled,false);
 assert.equal(emailOnlyConfig({...env,VERCEL_ENV:'preview',TRUECRAFT_EMAIL_ONLY_TEST_UNTIL:'100'},100).enabled,false);
});
