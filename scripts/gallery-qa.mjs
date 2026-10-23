import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const origin=process.argv[2]||'http://127.0.0.1:4174';
const output=process.argv[3]||'docs/qa/gallery-update';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900}});
 for(const route of ['/','/services/','/our-work/','/about/','/request-estimate/','/privacy/']){
  const r=await page.goto(origin+route); assert.equal(r.status(),200);
  assert.equal(await page.locator('form').count(),0);
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://truecraft-home-improvements.vercel.app'+route);
  assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'index, follow');
  assert(await page.locator('a[href="tel:+19032750361"]').count());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const img of await page.locator('img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());assert(await img.evaluate(i=>i.naturalWidth>0));}
  assert.equal(await page.locator('img[src="/images/front-porch.jpg"]').count(),0);
  if(['/', '/services/', '/our-work/'].includes(route)) {
   assert.equal(await page.locator('img[src="/images/elevated-covered-front-porch.jpg"]').count(),1);
   const porch=page.locator('img[src="/images/elevated-covered-front-porch.jpg"]').first();
   await porch.scrollIntoViewIfNeeded();
   await page.screenshot({path:`${output}/porch-${route==='/'?'home':route.split('/')[1]}-${width}.png`});
  }
  if(route==='/'){
   const card=page.locator('.service-card').filter({hasText:'Outdoor projects'});
   assert.equal(await card.locator('img').getAttribute('src'),'/images/covered-front-porch-brick-base.jpg');
   await card.scrollIntoViewIfNeeded();
   await card.screenshot({path:`${output}/outdoor-card-${width}.png`});
  }
  if(route==='/our-work/'){
   assert.equal(await page.locator('figure[data-category]').count(),16);
   for(const a of await page.locator('.photo-link').all())assert.equal((await page.request.get(new URL(await a.getAttribute('href'),origin).href)).status(),200);
   await page.getByRole('button',{name:'Outdoors',exact:true}).click();
   assert.equal(await page.locator('figure[data-category]:visible').count(),4);
   assert.equal(await page.locator('.project-set').first().isVisible(),false);
   await page.getByRole('button',{name:'Interiors',exact:true}).click();assert.equal(await page.locator('figure[data-category]:visible').count(),12);
   await page.getByRole('button',{name:'All photographs',exact:true}).click();
   await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:`${output}/gallery-${width}.png`,fullPage:true});
   await page.screenshot({path:`${output}/gallery-top-${width}.png`});
  }
 }
 await page.close();
}
await browser.close();console.log('PASS: six production routes at 390/1440; 16 images, full-image links, filters 4/12/16, no overflow, canonical/indexability, call-only.');
