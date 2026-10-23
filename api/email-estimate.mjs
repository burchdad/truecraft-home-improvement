import {verificationDetails} from '../src/email-verification.mjs';
import {validateEstimateRequest} from '../public/validation.js';
import {checkBotId} from 'botid/server';
import {createEmailOnlyIntake,createLocalThrottle} from '../src/email-only-intake.mjs';
import {createEstimateHttpHandler,createEstimateNotifier} from '../src/estimate-intake.mjs';
const throttle=createLocalThrottle();
export default async function handler(req,res){
 // Review-only gate. Production cannot activate this implementation accidentally.
 const enabled=process.env.VERCEL_ENV==='preview'&&process.env.TRUECRAFT_EMAIL_ONLY_VERIFICATION==='true'&&Number(process.env.TRUECRAFT_EMAIL_ONLY_TEST_UNTIL)>Date.now();
 const origin=process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:undefined;
 const notifier=createEstimateNotifier({enabled,mode:'verification',apiKey:process.env.TRUECRAFT_RESEND_API_KEY,from:'truecraft@ghostai.solutions'});
 const intake=createEmailOnlyIntake({enabled,mode:'verification',origin,notifier,throttle,
  verifyHuman:()=>checkBotId({developmentOptions:{isDevelopment:false},advancedOptions:{checkLevel:'basic'}})});
 const protectedIntake=async request=>{
  if(enabled&&JSON.stringify(validateEstimateRequest(request.body).data)!==JSON.stringify(validateEstimateRequest(verificationDetails).data))return {status:403,body:{accepted:false,message:'This review accepts only the approved fictional verification request.'}};
  return intake(request);
 };
 return createEstimateHttpHandler({intake:protectedIntake,clientId:r=>process.env.VERCEL==='1'?r.headers['x-vercel-forwarded-for']:null})(req,res);
}
