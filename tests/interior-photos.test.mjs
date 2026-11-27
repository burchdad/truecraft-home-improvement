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
  const home = render('/', { production: true });
  const servicesPage = render('/services/', { production: true });
  const interiorPage = render('/services/drywall-interior-improvements/', { production: true });
  assert.match(home, /href="\/services\/drywall-interior-improvements\/"/);
  assert.match(servicesPage, /src="\/images\/project-131-wood-beam-room-and-adjoining-hall.jpg"/);
  assert.match(interiorPage, /src="\/images\/wood-interior.jpg"/);
  assert.doesNotMatch(servicesPage, /src="\/images\/wood-interior.jpg"/);
});
