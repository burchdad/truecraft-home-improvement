import test from 'node:test';
import assert from 'node:assert/strict';
import {render} from '../src/templates.mjs';
const siteUrl='https://www.truecrafthomeimprovement.com';
test('production is indexable, canonical and call-only',()=>{
 for(const path of ['/', '/services/', '/request-estimate/', '/privacy/']) {
 const html=render(path,{production:true,siteUrl});
 assert.match(html,/content="index, follow"/);
 assert.ok(html.includes(`rel="canonical" href="${siteUrl}${path}"`));
 assert.doesNotMatch(html,/<form|PRIVATE DESIGN PREVIEW|Sending unavailable/);
 assert.match(html,/tel:\+19032750361/);
 }
 assert.match(render('/',{production:true,siteUrl}),/29 Google reviews/);
 assert.match(render('/',{production:true,siteUrl}),/October 19, 2026/);
 assert.match(render('/404/',{production:true,siteUrl}),/noindex, nofollow/);
});
test('default preview retains noindex and disconnected form',()=>{
 const html=render('/request-estimate/');
 assert.match(html,/noindex, nofollow/);
 assert.match(html,/PRIVATE DESIGN PREVIEW/);
 assert.match(html,/Online sending unavailable/);
});
test('estimate actions call directly and planning remains secondary', () => {
 for (const path of ['/', '/services/', '/our-work/', '/about/', '/request-estimate/']) {
  const html=render(path,{production:true,siteUrl});
  assert.doesNotMatch(html,/Prefer to talk|Request an estimate|<form/);
  assert.match(html, /class="button" href="tel:\+19032750361">Call/);
  assert.doesNotMatch(html, /class="button" href="\/request-estimate\//);
 }
 const home=render('/',{production:true,siteUrl});
 assert.match(home,/class="service-card" href="\/services\/#kitchens-bathrooms"/);
 assert.match(home,/href="\/request-estimate\/">Plan your call/);
 assert.match(render('/request-estimate/',{production:true,siteUrl}),/What to have in mind/);
});
test('approved production intake is indexable, clear and email-only while preserving calls',()=>{
 const html=render('/request-estimate/',{production:true,siteUrl,emailIntake:true});
 assert.match(html,/data-submit-enabled="true" data-endpoint="\/api\/email-estimate"/);
 assert.match(html,/No price is calculated here/);assert.match(html,/does not save a backup/);
 assert.match(html,/email-only-botid.js/);assert.match(html,/tel:\+19032750361/);
 assert.doesNotMatch(html,/Fictional email verification|Preview —|Online sending unavailable/);
 const privacy=render('/privacy/',{production:true,siteUrl,emailIntake:true});
 assert.match(privacy,/Resend/);assert.match(privacy,/BotID/);assert.doesNotMatch(privacy,/A call-only website/);
});
