import test from 'node:test';
import assert from 'node:assert/strict';
import {render} from '../src/templates.mjs';
const siteUrl='https://truecraft-home-improvements-ghostaisolutions-projects.vercel.app';
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
