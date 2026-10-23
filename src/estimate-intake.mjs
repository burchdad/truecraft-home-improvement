import { createHash } from 'node:crypto';
import { validateEstimateRequest } from '../public/validation.js';
import { ResendInquiryAdapter } from './adapters/resend.mjs';
export const INQUIRY_RECIPIENT='Texastruecrafthomes@gmail.com';
const unavailable=()=>({status:503,body:{accepted:false,message:'Online requests are not enabled. Please call (903) 275-0361.'}});
// No environment activation. A reviewed production bootstrap must supply durable
// storage, an atomic shared limiter, verified sender and server-only credentials.
export function createEstimateIntake({enabled=false,origin,store,limiter,notifier,now=Date.now}={}){
 return async ({body,requestOrigin,key,clientId})=>{
  if(!enabled||!store?.durable||!limiter?.shared||!notifier||!origin)return unavailable();
  if(requestOrigin!==origin)return {status:403,body:{accepted:false,message:'Request origin not allowed.'}};
  if(!clientId)return unavailable();
  try{
   if(!await limiter.consume(clientId,{limit:5,windowMs:60000}))return {status:429,body:{accepted:false,message:'Too many attempts. Please wait a minute or call.'}};
   const {data,errors}=validateEstimateRequest(body);
   if(data.website)return {status:400,body:{accepted:false,message:'Unable to accept request. Please call.'}};
   if(Object.keys(errors).length)return {status:422,body:{accepted:false,errors}};
   if(!/^[a-zA-Z0-9-]{16,80}$/.test(key||''))return {status:400,body:{accepted:false,message:'A valid request key is required.'}};
   const fingerprint=createHash('sha256').update(JSON.stringify(data)).digest('hex');
   // reserve atomically persists validated data, consent version/time and a
   // unique key+fingerprint, and grants only one active processing lease.
   const record=await store.reserve({key,fingerprint,data,consentVersion:'estimate-request-v1',createdAt:now(),recipient:INQUIRY_RECIPIENT});
   if(record.conflict)return {status:409,body:{accepted:false,message:'Request changed. Start a new request.'}};
   if(record.durable!==true||!record.id)return unavailable();
   if(record.notification==='submitted')return accepted(record.id);
   if(!record.claimed)return {status:409,body:{accepted:false,message:'Request is processing. Please wait before retrying.'}};
   if(now()-record.createdAt>=23*60*60*1000){await store.recordOutcome(record.id,{status:'needs_reconciliation'});return unavailable();}
   const outcome=await notifier.notify({leadId:record.id,data:record.data});
   // A durable audit result is required before any browser success response.
   await store.recordOutcome(record.id,outcome);
   if(outcome.status==='submitted'&&outcome.providerId)return accepted(record.id);
   return {status:503,body:{accepted:false,message:'Request recorded, but email submission is unconfirmed. Please call (903) 275-0361.'}};
  }catch{return {status:503,body:{accepted:false,message:'We could not confirm submission. Please call (903) 275-0361.'}};}
 };
}
function accepted(id){return {status:202,body:{accepted:true,id,notification:'submitted',message:'Request recorded and accepted by the email service. Inbox delivery and review are not confirmed. No price or booking is confirmed.'}};}
export function createEstimateNotifier({enabled=false,apiKey,from,fetchImpl}={}){
 // Recipient cannot be supplied or overridden by inbound form data.
 return new ResendInquiryAdapter({enabled,apiKey,from,to:INQUIRY_RECIPIENT,fetchImpl});
}
export function createEstimateHttpHandler({intake=createEstimateIntake(),clientId=()=>null}={}){
 return async (req,res)=>{
  const reply=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(status===429?{'Retry-After':'60'}:{})});res.end(JSON.stringify(body));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(405,{accepted:false});}
  if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return reply(415,{accepted:false});
  let raw='',bytes=0;
  try{for await(const chunk of req){bytes+=Buffer.byteLength(chunk);if(bytes>12000)return reply(413,{accepted:false});raw+=chunk;}}catch{return reply(400,{accepted:false});}
  let body;try{body=JSON.parse(raw);}catch{return reply(400,{accepted:false});}
  const result=await intake({body,requestOrigin:req.headers.origin,key:req.headers['idempotency-key'],clientId:clientId(req)});
  return reply(result.status,result.body);
 };
}
