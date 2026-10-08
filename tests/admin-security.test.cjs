const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
// Load the actual dependency-free validators without adding a production runner.
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText, filename);
};
const model = require('../src/lib/admin/model.ts');
const { inspectImage, maxImageBytes } = require('../src/lib/admin/upload.ts');

test('staff permission matrix rejects operational and security access for editors', () => {
  for (const section of ['packages', 'collections', 'gallery', 'reviews', 'media']) assert.equal(model.canAccess('editor', section), true);
  for (const section of ['orders', 'customers', 'settings', 'content', 'admins', 'activity']) assert.equal(model.canAccess('editor', section), false);
  assert.equal(model.canAccess('admin', 'admins'), false);
  assert.equal(model.canAccess('admin', 'activity'), false);
  assert.equal(model.canAccess('super_admin', 'admins'), true);
  assert.equal(model.canAccess('super_admin', 'unknown'), false);
});
test('profile, role and order ownership fields cannot be mass assigned', () => {
  for (const field of ['user_id', 'customer_id', 'items', 'total_amount', 'package_name', 'order_status']) assert.throws(() => model.validateValues('orders', { [field]: 'tampered' }), model.InputError);
  assert.throws(() => model.validateValues('customers', { role: 'super_admin' }), model.InputError);
});
test('published rating input cannot fabricate averages or exceed five stars', () => {
  for (const rating of [0, 6, 4.5, 'invalid']) assert.throws(() => model.validateValues('reviews', { rating }), model.InputError);
  assert.deepEqual(model.validateValues('reviews', { rating: 5 }), { rating: 5 });
  assert.throws(() => model.validateValues('content', { key: 'average_rating', value: 4.9 }), model.InputError);
});
test('quote and cake packages do not persist a made-up fixed price', () => {
  assert.equal(model.validateValues('packages', { order_mode: 'enquiry', price: 18000 }).price, null);
  assert.equal(model.validateValues('packages', { order_mode: 'cake', price: 10000 }).price, null);
  assert.throws(() => model.validateValues('packages', { price: -1 }), model.InputError);
});
test('slug and identifiers reject query syntax and missing identity', () => {
  for (const slug of ['../admin', 'A B', 'foo,active.eq.true', '']) assert.throws(() => model.validateValues('packages', { slug }), model.InputError);
  assert.throws(() => model.identifier('new', 'orders'), model.InputError);
  assert.equal(model.identifier('simple-elegant', 'packages'), 'simple-elegant');
});
test('redirects reject external, backslash and encoded path variants', () => {
  for (const next of ['//evil.example', '/\\evil.example', '/%2fevil.example', '/%5cevil.example', 'https://evil.example', '/admin\n']) assert.equal(model.safeInternalPath(next), '/dashboard');
  assert.equal(model.safeInternalPath('/admin/reset-password'), '/admin/reset-password');
});
test('settings expose business contacts only and require HTTPS', () => {
  assert.throws(() => model.validateValues('settings', { key: 'hero_heading', value: 'Changed' }), model.InputError);
  assert.throws(() => model.validateValues('settings', { key: 'instagram', value: 'javascript:alert(1)' }), model.InputError);
  assert.throws(() => model.validateValues('settings', { key: 'cms_enabled', value: 'false' }), model.InputError);
});
test('media references refuse arbitrary hosts, data URLs and scripts', () => {
  for (const value of ['javascript:alert(1)', 'data:image/png;base64,abc', '//evil.example/image.png', 'https://evil.example/image.jpg']) assert.throws(() => model.imagePath(value), model.InputError);
  assert.equal(model.imagePath('/assets-1/packages/1.jpg'), '/assets-1/packages/1.jpg');
});
test('image upload checks signatures, size, MIME and extension together', () => {
  const jpeg = new Uint8Array([255, 216, 255, 224]);
  assert.equal(inspectImage(jpeg, 'photo.JPEG', 'image/jpeg'), 'jpg');
  assert.throws(() => inspectImage(jpeg, 'photo.php', 'image/jpeg'), model.InputError);
  assert.throws(() => inspectImage(new TextEncoder().encode('<svg></svg>'), 'photo.jpg', 'image/jpeg'), model.InputError);
  assert.throws(() => inspectImage(jpeg, 'photo.jpg', 'image/svg+xml'), model.InputError);
  assert.throws(() => inspectImage(new Uint8Array(maxImageBytes + 1), 'photo.jpg', 'image/jpeg'), model.InputError);
  assert.throws(() => inspectImage(new Uint8Array(0), 'photo.jpg', 'image/jpeg'), model.InputError);
});
test('Colombo date uses the business timezone at the UTC day boundary', () => {
  assert.equal(model.localDate(0, new Date('2026-10-04T20:00:00Z')), '2026-10-05');
  assert.equal(model.localDate(1, new Date('2026-10-04T20:00:00Z')), '2026-10-06');
  assert.equal(model.normalizePhone('077 123 4567'), '94771234567');
});
