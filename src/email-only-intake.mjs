import {createHash} from 'node:crypto';
import {validateEstimateRequest} from '../public/validation.js';
const unavailable=()=>({status:503,body:{accepted:false,message:'Online sending is unavailable. Please call (903) 275-0361.'}});
// Supplemental per-instance protection only. Not a durable/shared rate limiter.
export function createLocalThrottle({now=Date.now,maxEntries=2000}={}){
 const counters=new Map();
 return {consume(identity){const time=now();for(const [k,v] of counters)if(v.expires<=time)counters.delete(k);
  const key=createHash('sha256').update(identity).digest('hex');let value=counters.get(key);
  if(!value){if(counters.size>=maxEntries)return false;value={count:0,expires:time+60000};counters.set(key,value);}
  return ++value.count<=3;
 }};
}
export function createEmailOnlyIntake({enabled=false,origin,notifier,verifyHuman,throttle=createLocalThrottle(),mode='verification'}={}){
 return async({body,requestOrigin,clientId})=>{
  if(!enabled||!origin||!notifier||typeof verifyHuman!=='function'||!clientId)return unavailable();
  if(!['verification','production'].includes(mode))return unavailable();
  if(requestOrigin!==origin)return {status:403,body:{accepted:false,message:'Request origin not allowed.'}};
  try{
   if(!throttle.consume(clientId))return {status:429,body:{accepted:false,message:'Too many attempts. Please wait a minute or call.'}};
   const {data,errors}=validateEstimateRequest(body);
   if(data.website)return {status:400,body:{accepted:false,message:'Unable to submit request. Please call.'}};
   if(Object.keys(errors).length)return {status:422,body:{accepted:false,errors}};
   const proof=await verifyHuman();
   if(proof?.isHuman!==true||proof?.isBot!==false||proof?.isVerifiedBot===true||proof?.bypassed===true)return {status:403,body:{accepted:false,message:'Browser verification failed. Please call or try again.'}};
   // Same normalized details produce the same message and key across instances.
   // Bump this version if the email template changes. Provider dedupe lasts 24h.
   const id=createHash('sha256').update(JSON.stringify(['email-only-v1',mode,data])).digest('hex');
   const result=await notifier.notify({leadId:id,data});
   if(result.status==='submitted'&&result.providerId)return {status:202,body:{accepted:true,id,notification:'submitted',message:'The email service accepted your request. Inbox delivery and review are not confirmed. No price or booking is confirmed.'}};
   return {status:503,body:{accepted:false,message:'We could not confirm email submission. Your details have not been saved by this website. Please call (903) 275-0361. The email may have been accepted; avoid repeated submissions.'}};
  }catch{return unavailable();}
 };
}
