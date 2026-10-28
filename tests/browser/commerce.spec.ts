import { test, expect, auth, paymentWidget, summary, quote } from './fixtures';
const gallery = 'http://127.0.0.1:3111';
test('paid class purchase waits for verification; failure retries the same order after reload', async ({ page }) => {
 await auth(page); await paymentWidget(page); let orders = 0; let verifies = 0;
 await page.route('**/api/v1/commerce/orders', async r => { orders++; expect(r.request().postDataJSON()).toEqual({ session_id: 'class-1' }); expect(r.request().headers().authorization).toBe('Bearer test-token'); await r.fulfill({ json: { order_id: 'order-1', razorpay_order_id: 'rzp-order', razorpay_key_id: 'test', amount: 100, currency: 'INR' } }); });
 await page.route('**/api/v1/commerce/payments/verify', async r => { expect(r.request().postDataJSON()).toMatchObject({ order_id: 'order-1', razorpay_payment_id: 'test-payment' }); await r.fulfill(++verifies === 1 ? { status: 503, json: { detail: 'Confirmation pending' } } : { json: { status: 'ACTIVE' } }); });
 await page.goto(`${gallery}/?paid`); await page.getByRole('button', { name: /^Pay/ }).click(); await expect(page.getByRole('alert')).toContainText('Confirmation pending');
 await expect(page.getByRole('heading', { name: 'Purchase complete' })).toHaveCount(0);
 await page.reload(); await page.getByRole('button', { name: 'Retry payment confirmation' }).click(); await expect(page.getByRole('heading', { name: 'Purchase complete' })).toBeVisible();
 expect(orders).toBe(1); expect(verifies).toBe(2); expect(await page.evaluate(() => sessionStorage.getItem('pr_payment_recovery_class_class-1_default'))).toBeNull();
});
test('free enrollment verifies before activation', async ({ page }) => {
 await auth(page); await page.route('**/api/v1/commerce/orders', r => r.fulfill({ json: { order_id: 'free-order', razorpay_order_id: 'free', free: true } }));
 await page.route('**/api/v1/commerce/payments/verify', async r => { expect(r.request().postDataJSON().razorpay_signature).toBe('free-enrollment'); await r.fulfill({ json: { status: 'ACTIVE' } }); });
 await page.goto(gallery); await page.getByRole('button', { name: 'Confirm free enrollment' }).click(); await expect(page.getByRole('heading', { name: 'Purchase complete' })).toBeVisible();
});
test('dismissed payment can retry without a false success', async ({ page }) => {
 await auth(page); await paymentWidget(page, 'dismiss'); await page.route('**/api/v1/commerce/orders', r => r.fulfill({ json: { order_id: 'order-1', razorpay_order_id: 'rzp-order', amount: 100, currency: 'INR' } }));
 await page.goto(`${gallery}/?paid`); await page.getByRole('button', { name: /^Pay/ }).click(); await expect(page.getByRole('button', { name: /^Pay/ })).toBeEnabled(); await expect(page.getByRole('heading', { name: 'Purchase complete' })).toHaveCount(0);
});
test('billing consent, quote total and verified purchase history', async ({ page }) => {
 await auth(page, 'STUDIO'); await paymentWidget(page); let paid = false;
 const purchase = { id: 'purchase-1', status: 'PENDING', quote, razorpay_key_id: 'test', razorpay_order_id: 'rzp-order', receipt_number: 'TEST-001' };
 await page.route('**/api/v1/organizations/studio-1/saas-billing', r => r.fulfill({ json: { ...summary, purchases: paid ? [{ ...purchase, status: 'PAID' }] : [] } }));
 await page.route('**/saas-billing/quote', async r => { expect(r.request().postDataJSON()).toEqual({ plan_id: 'core', billing_country: 'IN' }); await r.fulfill({ json: quote }); });
 await page.route('**/saas-billing/checkouts', async r => { expect(r.request().postDataJSON()).toMatchObject({ expected_total_paise: 12036, billing_country: 'IN', plan_id: 'core' }); await r.fulfill({ json: purchase }); });
 await page.route('**/saas-billing/checkouts/purchase-1/verify', async r => { paid = true; await r.fulfill({ json: { status: 'PAID' } }); });
 await page.goto(`${gallery}/?view=billing`); await page.getByRole('combobox').selectOption('IN'); await page.getByRole('button', { name: 'Review Core plan' }).click();
 const pay = page.getByRole('button', { name: /Pay .*Razorpay/ }); await expect(pay).toBeDisabled(); await page.getByRole('checkbox').check(); await pay.click();
 await expect(page.getByRole('status')).toContainText('Payment verified'); await expect(page.getByText(/PAID.*TEST-001/)).toBeVisible(); expect(await page.evaluate(() => sessionStorage.getItem('saas-checkout:studio-1:core'))).toBeNull();
});
test('billing permission denial exposes no payment controls', async ({ page }) => {
 await auth(page, 'TEACHER'); await page.route('**/api/v1/organizations/studio-1/saas-billing', r => r.fulfill({ status: 403, json: { detail: 'Owner access required' } }));
 await page.goto(`${gallery}/?view=billing`); await expect(page.getByRole('alert')).toContainText('Owner access required'); await expect(page.getByRole('combobox')).toHaveCount(0); await expect(page.getByRole('button', { name: /^Pay/ })).toHaveCount(0);
});
test('pending subscription reconciles into paid history without starting checkout', async ({ page }) => {
 await auth(page, 'STUDIO'); let paid = false;
 const purchase = { id: 'pending-1', status: 'PENDING', quote, razorpay_key_id: 'test', razorpay_order_id: 'rzp-order', receipt_number: 'TEST-002' };
 await page.route('**/api/v1/organizations/studio-1/saas-billing', r => r.fulfill({ json: { ...summary, purchases: [{ ...purchase, status: paid ? 'PAID' : 'PENDING' }] } }));
 await page.route('**/saas-billing/checkouts/pending-1/reconcile', async r => { paid = true; await r.fulfill({ json: { status: 'PAID' } }); });
 await page.goto(`${gallery}/?view=billing`); await page.getByRole('button', { name: 'Check payment' }).click(); await expect(page.getByRole('status')).toContainText('Payment verified'); await expect(page.getByText(/PAID.*TEST-002/)).toBeVisible(); await expect(page.getByRole('button', { name: 'Check payment' })).toHaveCount(0);
});
test('guest checkout goes to sign in before creating any order', async ({ page }) => {
 await page.goto(`${gallery}/?paid`); await page.getByRole('button', { name: /^Pay/ }).click();
 await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('next') === '/?paid');
});
test('denied class purchase does not activate access', async ({ page }) => {
 await auth(page); await page.route('**/api/v1/commerce/orders', r => r.fulfill({ status: 403, json: { detail: 'Purchase not permitted' } }));
 await page.goto(gallery); await page.getByRole('button', { name: 'Confirm free enrollment' }).click(); await expect(page.getByRole('alert')).toContainText('Purchase not permitted'); await expect(page.getByRole('heading', { name: 'Purchase complete' })).toHaveCount(0);
});
test('expired checkout clears credentials and preserves the sign-in destination', async ({ page }) => {
 await auth(page); await page.route('**/api/v1/commerce/orders', r => r.fulfill({ status: 401, json: { detail: 'Session expired' } }));
 await page.goto(`${gallery}/?paid`); await page.getByRole('button', { name: /^Pay/ }).click(); await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('next') === '/?paid');
 expect(await page.evaluate(() => localStorage.getItem('pr_access_token'))).toBeNull(); expect(await page.evaluate(() => localStorage.getItem('pr_user'))).toBeNull();
});
