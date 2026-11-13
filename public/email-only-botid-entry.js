import {initBotId} from 'botid/client/core';
initBotId({protect:[{path:'/api/email-estimate',method:'POST'},{path:'/api/email-bot-check',method:'POST'}]});

const button=document.querySelector('#check-botid');
button?.addEventListener('click',async()=>{button.disabled=true;const status=document.querySelector('#botid-result');try{const response=await fetch('/api/email-bot-check',{method:'POST'});const result=await response.json();status.textContent=result.verified?'Browser verification passed. No email was sent.':`Browser verification failed (${response.status}). No email was sent.`;}catch{status.textContent='Browser check unavailable. No email was sent.';}finally{button.disabled=false;}});
