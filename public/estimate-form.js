import { validateEstimateRequest, projectTypes } from './validation.js';
const form=document.querySelector('#estimate-request');
if(form){
 const check=document.querySelector('#check-estimate'), send=document.querySelector('#send-estimate'), status=document.querySelector('#estimate-status'), summary=document.querySelector('#estimate-errors');
 check.hidden=false;
 const method=form.elements.method,contact=form.elements.contact;
 let pending=false, key=null, fingerprint=null, confirmed=false;
 method.addEventListener('change',()=>{contact.value='';contact.type=method.value==='email'?'email':'tel';contact.autocomplete=contact.type;document.querySelector('label[for="contact"]').textContent=method.value==='email'?'Email address':'Phone number';});
 const project=new URLSearchParams(location.search).get('project');if(projectTypes.includes(project))form.elements.project.value=project;
 function validate(){
  const raw=Object.fromEntries(new FormData(form));
  const {errors,data}=validateEstimateRequest(raw);
  summary.replaceChildren();form.querySelectorAll('.field-error').forEach(e=>e.textContent='');form.querySelectorAll('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));
  const keys=Object.keys(errors);summary.hidden=!keys.length;
  if(keys.length){const heading=document.createElement('strong');heading.textContent='Please check these details:';summary.append(heading);const list=document.createElement('ul');summary.append(list);for(const name of keys){const control=form.elements[name];if(!control)continue;control.setAttribute('aria-invalid','true');document.getElementById(`${name}-error`).textContent=errors[name];const li=document.createElement('li'),a=document.createElement('a');a.href=`#${name}`;a.textContent=errors[name];li.append(a);list.append(li);}summary.focus();return null;}
  return data;
 }
 check.addEventListener('click',()=>{status.textContent='';if(validate())status.textContent='Details checked locally. Nothing was sent or saved. Use Send project details to submit, or call (903) 275-0361.';});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(pending||confirmed)return;status.textContent='';const data=validate();if(!data)return;
  if(form.dataset.submitEnabled!=='true'){status.textContent='Online sending is not enabled. Nothing was sent or saved. Please call (903) 275-0361.';return;}
  const snapshot=JSON.stringify(data);if(snapshot!==fingerprint){key=crypto.randomUUID();fingerprint=snapshot;}
  pending=true;send.disabled=true;const controls=[...form.querySelectorAll('input,select,textarea,#check-estimate')];controls.forEach(c=>c.disabled=true);form.setAttribute('aria-busy','true');status.textContent='Submitting your details…';
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
  try{
   const response=await fetch(form.dataset.endpoint || '/api/estimate-requests',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:snapshot,signal:controller.signal});
   const result=await response.json();
   if(response.ok&&result.accepted===true&&typeof result.id==='string'&&result.id&&result.notification==='submitted'){
    confirmed=true;status.textContent='Your request was accepted by the email service for TrueCraft. Inbox delivery and Bo’s review are not yet confirmed. No price or booking is confirmed.';
   }else {status.textContent=response.status===429?'Too many attempts. Please wait a minute or call (903) 275-0361.':'We could not confirm email submission. Your details remain here; please call (903) 275-0361. If you retry unchanged details, the same request key will be reused.';}
  }catch{status.textContent='We could not confirm submission. Your details remain here. Please call (903) 275-0361 or retry; do not assume the email arrived.';}
  finally{clearTimeout(timer);pending=false;controls.forEach(c=>c.disabled=false);form.removeAttribute('aria-busy');send.disabled=confirmed;status.focus();}
 });
}
