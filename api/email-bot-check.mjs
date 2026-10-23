import {checkBotId} from 'botid/server';
// Read-only preview diagnostic: no email adapter, database, or inquiry values.
export default async function handler(req,res){
 const reply=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));};
 if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(405,{verified:false});}
 if(process.env.VERCEL_ENV!=='preview')return reply(404,{verified:false});
 if(!process.env.VERCEL_URL||req.headers.origin!==`https://${process.env.VERCEL_URL}`)return reply(403,{verified:false,reason:'origin'});
 try{const result=await checkBotId({developmentOptions:{isDevelopment:false},advancedOptions:{checkLevel:'basic'}});
 const verified=result.isHuman===true&&result.isBot===false&&result.isVerifiedBot!==true&&result.bypassed!==true;
 return reply(verified?200:403,{verified,sendsEmail:false});
 }catch{return reply(503,{verified:false,sendsEmail:false,reason:'verification-unavailable'});}
}
