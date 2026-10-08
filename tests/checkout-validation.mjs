import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('public/storefront.html', 'utf8');
const formMarkup = html.match(/<form[^>]*data-checkout-form[\s\S]*?<\/form>/)[0];
const fieldNames = [...formMarkup.matchAll(/name="([^"]+)"/g)].map((match) => match[1]);
const values = Object.fromEntries(fieldNames.map((name) => [name, '']));
Object.assign(values, {
  customer_name: 'Test Customer', customer_phone: '0771234567',
  surprise_date: '2026-10-17', surprise_location: 'Colombo 14',
  surprise_time: '10:41', surprise_type: 'Anniversary',
  recipient_name: 'Test Recipient', recipient_relationship: 'Boyfriend',
});
const fields = fieldNames.map((name) => ({
  querySelector: () => ({ name }), classList: { toggle() {} },
}));
const script = fs.readFileSync('public/script.js', 'utf8');
const start = script.indexOf('const getCheckoutDetails =');
const end = script.indexOf('const saveCheckoutDetails =', start);
const context = vm.createContext({
  checkoutForm: { querySelectorAll: () => fields },
  FormData: class { get(name) { return values[name] ?? null; } },
});
vm.runInContext(script.slice(start, end) + '\nthis.read = getCheckoutDetails; this.validate = validateCheckoutDetails;', context);
assert.equal(context.validate(context.read()).length, 0, 'A completed form must pass without optional fields');
for (const name of ['customer_name', 'customer_phone', 'surprise_date', 'surprise_location', 'surprise_time', 'surprise_type', 'recipient_name', 'recipient_relationship']) {
  const previous = values[name]; values[name] = '';
  assert.ok(context.validate(context.read()).some((field) => field.name === name), `${name} must remain required`);
  values[name] = previous;
}
values.surprise_date = '17/10/2026';
assert.ok(context.validate(context.read()).some((field) => field.name === 'surprise_date'));
values.surprise_date = '2026-10-17';
for (const [select, custom] of [['surprise_type', 'custom_surprise_type'], ['recipient_relationship', 'custom_relationship']]) {
  const previous = values[select]; values[select] = 'Other';
  assert.ok(context.validate(context.read()).some((field) => field.name === custom));
  values[custom] = 'Custom details';
  assert.equal(context.validate(context.read()).length, 0);
  values[select] = previous;
}
for (const path of ['src/app/(storefront)/page.tsx', 'src/app/(storefront)/collections/[slug]/page.tsx', 'public/storefront.html']) {
  assert.ok(fs.readFileSync(path, 'utf8').includes('/script.js?v=legal-payhere-20261008'), `${path} must load the updated script URL`);
}
console.log('Checkout regression checks passed: completed form, required fields, date format, Other details, and versioned script URLs.');
