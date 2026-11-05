import test from 'node:test';
import assert from 'node:assert/strict';
import { services, featuredProjects } from '../src/content.mjs';
import { render } from '../src/templates.mjs';

test('interior service and featured interior details use distinct project photographs', () => {
  const interiors = services.find((service) => service.id === 'interiors');
  const details = featuredProjects.find((project) => project.title === 'Interior details');
  assert.equal(interiors.photo, 24);
  assert.equal(details.id, 1);
  assert.notEqual(interiors.photo, details.id);
  const home = render('/');
  const serviceCard = home.match(/<a class="service-card" href="\/services\/#interiors">[\s\S]*?<\/a>/)?.[0];
  assert.ok(serviceCard);
  assert.match(serviceCard, /src="\/images\/dining-room-trim.jpg"/);
  assert.match(serviceCard, /Dining room with a vaulted ceiling, white crown molding and an arched opening\./);
  assert.doesNotMatch(serviceCard, /wood-interior/);
  assert.match(home, /src="\/images\/wood-interior.jpg"/);
});
