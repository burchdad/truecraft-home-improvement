import test from 'node:test';
import assert from 'node:assert/strict';
import {routes, servicePages} from '../src/content.mjs';
import {render} from '../src/templates.mjs';
const siteUrl = 'https://www.truecrafthomeimprovement.com';
test('service pages have distinct metadata, truthful structured data and crawlable discovery', () => {
 const titles = new Set(), descriptions = new Set();
 for (const [path] of routes) {
  const html = render(path, {siteUrl, production: true, emailIntake: true});
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  const description = html.match(/name="description" content="(.*?)"/)[1];
  assert.ok(!titles.has(title)); titles.add(title);
  assert.ok(!descriptions.has(description)); descriptions.add(description);
  assert.ok(html.includes(`rel="canonical" href="${siteUrl}${path}"`));
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  assert.doesNotMatch(description, /preview/i);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const business = schema['@graph'][0];
  assert.equal(business['@type'], 'HomeAndConstructionBusiness');
  for (const key of ['address','geo','aggregateRating','review','priceRange']) assert.equal(business[key], undefined);
  if (path.startsWith('/services/') && path !== '/services/') {
   assert.ok(schema['@graph'].some(item => item['@type'] === 'Service' && item.url === siteUrl + path));
   assert.equal(schema['@graph'].find(item => item['@type'] === 'BreadcrumbList').itemListElement.length, 3);
   assert.match(html, /href="\/request-estimate\/"/);
  }
 }
 const services = render('/services/', {siteUrl, production:true});
 for (const service of servicePages) assert.ok(services.includes(`href="/services/${service.slug}/"`));
});

test('public ownership tags persist in the shared head on every route and build mode', () => {
 const tags = [
  '<meta name="google-site-verification" content="uY54vnrgA6nBAv3z_xuGWU0vSGI7EqPuixry-_HAIMc" />',
  '<meta name="google-site-verification" content="kzgnwfsQuZN6KloZkS0VxdUXQrDWmPI8C7IXoRF3YnY" />',
  '<meta name="msvalidate.01" content="96D6D2B55D94154BE6C7F6B25E3B4EE8" />'
 ];
 for (const production of [false, true]) for (const [path] of [...routes, ['/404/']]) {
  const head = render(path, {siteUrl, production, emailIntake: true}).split('</head>')[0];
  for (const tag of tags) assert.equal(head.split(tag).length - 1, 1, `${path}: ${tag}`);
 }
});
