import {test,expect} from '@playwright/test';
import {render} from '../../src/templates.mjs';
for(const width of [375,1280])test(`production form layout and guarded submissions at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 await page.route('**/request-estimate/',route=>route.fulfill({contentType:'text/html',body:render('/request-estimate/',{production:true,emailIntake:true,siteUrl:'https://truecraft-home-improvements.vercel.app'})}));
 // Browser behavior only: BotID and transport are mocked, never send an email.
 await page.route('**/email-only-botid.js',route=>route.fulfill({contentType:'text/javascript',body:''}));
 let requests=0;const keys=[];
 await page.route('**/api/email-estimate',async route=>{requests++;keys.push(route.request().headers()['idempotency-key']);await route.fulfill({status:requests===1?503:202,contentType:'application/json',body:JSON.stringify(requests===1?{accepted:false}:{accepted:true,id:'synthetic-id',notification:'submitted'})});});
 await page.goto('/request-estimate/');
 await page.locator('#send-estimate').click();expect(requests).toBe(0);await expect(page.locator('#estimate-errors')).toBeVisible();
 await page.getByLabel('Your name',{exact:true}).fill('Fictional QA');await page.getByLabel('How should TrueCraft contact you?').selectOption('email');await page.getByLabel('Email address',{exact:true}).fill('test@example.invalid');await page.getByLabel('Project town or ZIP').fill('Tyler');await page.getByLabel('Project type').selectOption('other');await page.getByLabel('Describe your project').fill('Fictional local QA only; no work requested.');await page.getByLabel(/I agree to share/).check();
 await page.locator('#send-estimate').click();await expect(page.getByRole('status')).toContainText('could not confirm');
 await page.locator('#send-estimate').click();await expect(page.getByRole('status')).toContainText('Inbox delivery');await expect(page.locator('#send-estimate')).toBeDisabled();
 await page.locator('#estimate-request').evaluate(f=>f.requestSubmit());expect(requests).toBe(2);expect(keys[0]).toBe(keys[1]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`/workspace/truecraft-email-review/public-form-${width}.png`,fullPage:true});
});
