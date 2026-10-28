import { test as base, expect, type Page } from '@playwright/test';
// Every API request must be explicitly handled. No live backend or provider is contacted.
export const test = base.extend<{ apiGuard: void }>({
 apiGuard: [async ({ page }, use) => {
  const unexpected: string[] = [];
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/v1/**', async route => {
   unexpected.push(`${route.request().method()} ${new URL(route.request().url()).pathname}`);
   await route.fulfill({ status: 500, json: { detail: 'Unconfigured test API request' } });
  });
  await page.route('**/api/v1/auth/me/preferences', r => r.fulfill({ json: { dashboard_font: 'ibm-plex' } }));
  await page.route('https://**/*', route => route.abort());
  await use();
  expect(errors, 'Browser runtime errors').toEqual([]);
  expect(unexpected, 'Unexpected API requests require explicit fixtures').toEqual([]);
 }, { auto: true }],
});
export { expect };
export async function auth(page: Page, role = 'STUDENT') {
 await page.addInitScript(({ role }) => { if (!sessionStorage.getItem('test-auth-seeded')) { localStorage.setItem('pr_access_token', 'test-token'); localStorage.setItem('pr_user', JSON.stringify({ id: 'user-1', role, full_name: 'Test User' })); sessionStorage.setItem('test-auth-seeded', '1'); } }, { role });
}
export const quote = { plan_id: 'core', plan_name: 'Core', currency: 'INR', base_paise: 10000, platform_fee_paise: 200, gst_paise: 1836, total_paise: 12036, gst_bps: 1800 };
export const summary = { studio_name: 'Test studio', plan_name: 'Starter', access: { state: 'TRIAL' }, checkout_available: true, enforcement_enabled: true, purchases: [], plans: [{ id: 'core', name: 'Core', slug: 'core', base_paise: 10000, interval: 'MONTHLY' }] };
export async function paymentWidget(page: Page, outcome: 'success' | 'dismiss' | 'failed' = 'success') {
 await page.addInitScript(({ outcome }) => {
  const target = window as unknown as { Razorpay: unknown };
  target.Razorpay = class {
   callbacks: Record<string, () => void> = {};
   constructor(private options: { handler: (p: object) => void; modal: { ondismiss: () => void } }) {}
   on(event: string, callback: () => void) { this.callbacks[event] = callback; }
   open() { if (outcome === 'dismiss') this.options.modal.ondismiss(); else if (outcome === 'failed') { this.callbacks['payment.failed']?.(); this.options.modal.ondismiss(); } else this.options.handler({ razorpay_order_id: 'rzp-order', razorpay_payment_id: 'test-payment', razorpay_signature: 'test-signature' }); }
  };
 }, { outcome });
}
