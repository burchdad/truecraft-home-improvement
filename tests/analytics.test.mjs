import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {render} from '../src/templates.mjs';
import {routes} from '../src/content.mjs';

test('production routes configure the supplied tag once without custom events', () => {
  for (const [path] of routes) {
    const html = render(path, {production: true, emailIntake: true});
    assert.equal((html.match(/src="https:\/\/www.googletagmanager.com\/gtag\/js\?id=G-VTE47ZTCHG"/g) || []).length, 1);
    const script = html.match(/<script>\s*window.dataLayer[\s\S]*?<\/script>/)[0].replace(/<\/?script>/g, '');
    const context = {window: {}};
    context.window = context;
    vm.runInNewContext(script, context);
    assert.equal(context.dataLayer.length, 2);
    assert.equal(context.dataLayer[1][0], 'config');
    assert.equal(context.dataLayer[1][1], 'G-VTE47ZTCHG');
    assert.doesNotMatch(render(path), /googletagmanager|G-VTE47ZTCHG/);
  }
});

test('both production privacy variants disclose analytics', () => {
  for (const emailIntake of [false, true]) {
    const html = render('/privacy/', {production: true, emailIntake});
    assert.match(html, /Google Analytics uses cookies/);
    assert.doesNotMatch(html, /includes no analytics/);
  }
});
