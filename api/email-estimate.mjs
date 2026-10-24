import {emailOnlyConfig} from '../src/email-only-config.mjs';
import {verificationDetails} from '../src/email-verification.mjs';
import {validateEstimateRequest} from '../public/validation.js';
import {checkBotId} from 'botid/server';
import {createEmailOnlyIntake,createLocalThrottle} from '../src/email-only-intake.mjs';
import {createEstimateHttpHandler,createEstimateNotifier} from '../src/estimate-intake.mjs';
const throttle=createLocalThrottle();
export default async function handler(req,res){
 const {enabled,mode,origin}=emailOnlyConfig(process.env);
 const notifier=createEstimateNotifier({enabled,mode,apiKey:process.env.TRUECRAFT_RESEND_API_KEY,from:'truecraft@ghostai.solutions'});
 const intake=createEmailOnlyIntake({enabled,mode,origin,notifier,throttle,
  verifyHuman:()=>checkBotId({developmentOptions:{isDevelopment:false},advancedOptions:{checkLevel:'basic'}})});
 const protectedIntake=async request=>{
  if(enabled&&mode==='verification'&&JSON.stringify(validateEstimateRequest(request.body).data)!==JSON.stringify(validateEstimateRequest(verificationDetails).data))return {status:403,body:{accepted:false,message:'This review accepts only the approved fictional verification request.'}};
  return intake(request);
 };
 return createEstimateHttpHandler({intake:protectedIntake,clientId:r=>process.env.VERCEL==='1'?r.headers['x-vercel-forwarded-for']:null})(req,res);
}
