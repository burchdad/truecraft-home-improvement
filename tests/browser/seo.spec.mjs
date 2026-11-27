import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {servicePages} from '../../src/content.mjs';
import {render} from '../../src/templates.mjs';
import fs from 'node:fs/promises';
for (const width of [390,1440]) test(`production service pages at ${width}px`, async ({page}) => {
 await page.setViewportSize({width,height:900});
 for (const service of servicePages) {
  const path = `/services/${service.slug}/`;
  await page.route(`**${path}`, route => route.fulfill({contentType:'text/html',body:render(path,{production:true,emailIntake:true,siteUrl:'https://www.truecrafthomeimprovement.com'})}));
  await page.goto(path);
  await expect(page.locator('h1')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const img of await page.locator('img').all()) {
   await img.scrollIntoViewIfNeeded();
   await expect.poll(()=>img.evaluate(i=>i.naturalWidth)).toBeGreaterThan(0);
  }
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  for (const href of await page.locator('a').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>h.startsWith('/')))) {
   expect((await page.request.get(href)).status(),href).toBe(200);
  }
  await page.evaluate(()=>scrollTo(0,0));
  await fs.mkdir('/tmp/truecraft-seo-qa',{recursive:true});
  await page.screenshot({path:`/tmp/truecraft-seo-qa/${service.slug}-${width}.png`,fullPage:true});
 }
});
