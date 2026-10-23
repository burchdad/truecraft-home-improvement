import test from 'node:test';
import assert from 'node:assert/strict';
import {render} from '../src/templates.mjs';
const siteUrl='https://truecraft-home-improvements.vercel.app';
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
 assert.match(html,/Sending unavailable/);
});
test('estimate actions call directly and planning remains secondary', () => {
 for (const path of ['/', '/services/', '/our-work/', '/about/', '/request-estimate/']) {
  const html=render(path,{production:true,siteUrl});
  assert.doesNotMatch(html,/Prefer to talk|Request an estimate|<form/);
  assert.match(html, /class="button" href="tel:\+19032750361">Call/);
  assert.doesNotMatch(html, /class="button" href="\/request-estimate\//);
 }
 const home=render('/',{production:true,siteUrl});
 assert.match(home,/class="service-card" href="tel:\+19032750361"/);
 assert.match(home,/href="\/request-estimate\/">Plan your call/);
 assert.match(render('/request-estimate/',{production:true,siteUrl}),/What to have in mind/);
});
