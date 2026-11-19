import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url)));
function destination(path, method = 'GET', existing = new Set(['/','/index.html','/styles.css','/support.html'])) {
  for (const route of config.routes) {
    if (route.handle === 'filesystem') {
      if (existing.has(path)) return null;
      continue;
    }
    if (!route.methods.includes(method)) continue;
    const match = new RegExp(route.src, route.caseSensitive ? '' : 'i').exec(path);
    if (!match) continue;
    assert.equal(route.status, 307);
    assert.equal(route.headers['Cache-Control'], 'no-store');
    return route.headers.Location.replace(/\$(\d+)/g, (_, index) => match[Number(index)] ?? '');
  }
  return null;
}

test('stable public identities and editions retain their app path', () => {
  assert.equal(config.routes[0].handle, 'filesystem');
  for (const path of ['/panadic','/panadic/2026-2027','/panadic/2027-2028','/druga-liga','/ab/a']) {
    assert.equal(destination(path), `https://app.skorica.com${path}`);
    assert.equal(destination(path, 'HEAD'), `https://app.skorica.com${path}`);
    assert.equal(destination(`${path}/`), `https://app.skorica.com${path}`);
    assert.equal(destination(path, 'POST'), null);
  }
});

test('real marketing files and application namespaces are preserved', () => {
  for (const path of ['/','/index.html','/styles.css','/support.html','/assets/photo.webp','/demo','/account','/api/health','/login','/privacy','/cookies','/liga','/natjecanje','/turnir','/pwa','/manifest','/version'])
    assert.equal(destination(path), null, path);
  assert.equal(destination('/future-page', 'GET', new Set(['/future-page'])), null);
});

test('malformed or deep aliases never become redirects', () => {
  for (const path of ['/a',`/${'a'.repeat(81)}`,`/ab/${'a'.repeat(81)}`,'/panadić','/Panadic','/-panadic','/panadic-','/panadic--liga','/panadic/2026/extra','//external.example','/panadic/%2fadmin','/panadic/../admin'])
    assert.equal(destination(path), null, path);
  assert.equal(destination(`/${'a'.repeat(80)}`), `https://app.skorica.com/${'a'.repeat(80)}`);
});
