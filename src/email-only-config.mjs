import {PRODUCTION_ORIGIN} from "./site-config.mjs";
export const PUBLIC_ORIGIN=PRODUCTION_ORIGIN;
// Explicit production gate; preview flags cannot activate production.
export function emailOnlyConfig(env,now=Date.now()){
 const production=env.VERCEL_ENV==='production';
 const enabled=Boolean(env.TRUECRAFT_RESEND_API_KEY)&&(
  production ? env.TRUECRAFT_EMAIL_ONLY_ENABLED==='true' :
  env.VERCEL_ENV==='preview'&&env.TRUECRAFT_EMAIL_ONLY_VERIFICATION==='true'&&Number(env.TRUECRAFT_EMAIL_ONLY_TEST_UNTIL)>now
 );
 return {enabled,mode:production?'production':'verification',origin:production?PUBLIC_ORIGIN:(env.VERCEL_URL?`https://${env.VERCEL_URL}`:undefined)};
}
