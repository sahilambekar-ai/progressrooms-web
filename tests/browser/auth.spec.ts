import { test, expect, auth } from './fixtures';
test('student registration requires consent, preserves password, verifies OTP and returns to next', async ({ page }) => {
 let registration: Record<string, unknown> | undefined;
 await page.route('**/api/v1/auth/register', async r => { registration = r.request().postDataJSON(); await r.fulfill({ json: { message: 'Check email' } }); });
 await page.route('**/api/v1/auth/verify-otp', async r => { expect(r.request().postDataJSON()).toMatchObject({ email: 'new@example.test', otp: '123456', purpose: 'LOGIN_VERIFICATION' }); await r.fulfill({ json: { access_token: 'verified-token', user: { role: 'STUDENT', id: 'new-user' } } }); });
 await page.goto('/register?role=STUDENT&next=/pricing-policy');
 await page.getByLabel('Full Name').fill('Test Student'); await page.getByLabel('Email Address').fill('new@example.test');
 await page.locator('#register-password').fill(' long password '); await page.locator('#register-confirm-password').fill(' long password ');
 await page.getByLabel(/^Phone Number/).fill('+919876543210'); await page.getByLabel(/^Location/).fill('Pune');
 await page.getByRole('combobox').selectOption('IN');
 const submit = page.getByRole('button', { name: 'Register & Verify with OTP' }); await expect(submit).toBeDisabled();
 await page.getByRole('checkbox').check(); await submit.click();
 await expect(page.getByRole('textbox', { name: 'Six-digit verification code' })).toBeVisible();
 expect(registration).toMatchObject({ role: 'STUDENT', password: ' long password ', privacy_accepted: true, studio_name: null });
 await page.getByRole('textbox', { name: 'Six-digit verification code' }).fill('123456'); await page.getByRole('button', { name: 'Verify & Open Dashboard' }).click();
 await expect(page).toHaveURL('http://127.0.0.1:3110/pricing-policy'); expect(await page.evaluate(() => localStorage.getItem('pr_access_token'))).toBe('verified-token');
});
test('login reports rejected credentials, then preserves next and exact password', async ({ page }) => {
 let attempts = 0;
 await page.route('**/api/v1/auth/login', async r => { expect(r.request().postDataJSON()).toEqual({ email: 'student@example.test', password: ' password with spaces ' }); await r.fulfill(++attempts === 1 ? { status: 401, json: { detail: 'Invalid email or password' } } : { json: { is_verified: true, access_token: 'login-token', user: { role: 'STUDENT' } } }); });
 await page.goto('/login?next=/pricing-policy'); await page.getByLabel('Work or Student Email').fill('student@example.test'); await page.locator('#login-password').fill(' password with spaces ');
 await page.getByRole('button', { name: 'Sign In with Email & Password' }).click(); await expect(page.getByRole('alert').filter({ hasText: /Invalid/ })).toContainText('Invalid email or password');
 expect(await page.evaluate(() => localStorage.getItem('pr_access_token'))).toBeNull();
 await page.getByRole('button', { name: 'Sign In with Email & Password' }).click(); await expect(page).toHaveURL('http://127.0.0.1:3110/pricing-policy');
});
test('expired staff session redirects with requested studio destination intact', async ({ page }) => {
 await auth(page, 'STUDIO'); await page.route('**/api/v1/auth/me', r => r.fulfill({ status: 401, json: { detail: 'Session expired' } }));
 await page.goto('/dashboard?tab=billing-saas&studio_id=studio-1'); await expect(page).toHaveURL(/\/login\?next=/);
 expect(new URL(page.url()).searchParams.get('next')).toBe('/dashboard?tab=billing-saas&studio_id=studio-1');
});
test('foreign studio cannot silently switch into an authorized studio', async ({ page }) => {
 await auth(page, 'STUDIO'); await page.route('**/api/v1/auth/me', r => r.fulfill({ json: { id: 'owner', role: 'STUDIO' } }));
 await page.route('**/api/v1/auth/context?*', r => r.fulfill({ json: { organizations: [{ id: 'own-studio', name: 'Own studio' }] } }));
 await page.goto('/dashboard?studio_id=foreign-studio'); await expect(page).toHaveURL(/\/login\?next=/);
 expect(await page.evaluate(() => localStorage.getItem('pr_active_studio_id'))).toBeNull();
});
test('password recovery preserves new password and requires a fresh sign in', async ({ page }) => {
 await page.route('**/api/v1/auth/forgot-password', r => r.fulfill({ json: { message: 'Check email' } }));
 await page.route('**/api/v1/auth/reset-password', async r => { expect(r.request().postDataJSON()).toEqual({ email: 'student@example.test', code: '123456', new_password: ' new secure password ' }); await r.fulfill({ json: { message: 'Reset' } }); });
 await page.goto('/login'); await page.getByRole('button', { name: /Forgot/ }).click(); await page.locator('#reset-email').fill('student@example.test'); await page.getByRole('button', { name: 'Send Reset Code' }).click();
 await page.locator('#reset-code').fill('123456'); await page.locator('#new-password').fill(' new secure password '); await page.getByRole('button', { name: 'Save New Password' }).click();
 await expect(page.getByRole('status')).toContainText('All devices have been signed out'); await expect(page.getByRole('button', { name: 'Sign In with Email & Password' })).toBeVisible(); expect(await page.evaluate(() => localStorage.getItem('pr_access_token'))).toBeNull();
});
test('unverified login rejects invalid OTP then verifies before saving credentials', async ({ page }) => {
 let tries = 0;
 await page.route('**/api/v1/auth/login', r => r.fulfill({ json: { is_verified: false, requires_activation: true } }));
 await page.route('**/api/v1/auth/verify-otp', r => r.fulfill(++tries === 1 ? { status: 400, json: { detail: 'Invalid or expired code' } } : { json: { access_token: 'verified', user: { role: 'STUDENT' } } }));
 await page.goto('/login?next=/pricing-policy'); await page.locator('#login-email').fill('student@example.test'); await page.locator('#login-password').fill('secure-password'); await page.getByRole('button', { name: 'Sign In with Email & Password' }).click();
 await page.getByRole('textbox', { name: 'Six-digit verification code' }).fill('123456'); await page.getByRole('button', { name: 'Verify & Open Dashboard' }).click(); await expect(page.getByRole('alert').filter({ hasText: /Invalid/ })).toContainText('Invalid or expired code'); expect(await page.evaluate(() => localStorage.getItem('pr_access_token'))).toBeNull();
 await page.getByRole('button', { name: 'Verify & Open Dashboard' }).click(); await expect(page).toHaveURL('http://127.0.0.1:3110/pricing-policy');
});
test('studio registration requires a studio name and submits studio onboarding details', async ({ page }) => {
 let submitted = false;
 await page.route('**/api/v1/auth/register', async r => { expect(r.request().postDataJSON()).toMatchObject({ role: 'STUDIO', studio_name: 'Test Studio', selected_plan: 'core', privacy_accepted: true }); submitted = true; await r.fulfill({ json: { message: 'Verify account' } }); });
 await page.goto('/register?role=STUDIO&plan=core'); await page.getByLabel('Full Name').fill('Test Owner'); await page.getByLabel('Email Address').fill('owner@example.test'); await page.locator('#register-password').fill('secure-password'); await page.locator('#register-confirm-password').fill('secure-password'); await page.locator('#register-phone').fill('+919876543210'); await page.getByLabel(/^Location/).fill('Pune'); await page.getByRole('combobox').selectOption('IN'); await page.getByRole('checkbox').check();
 const submit = page.getByRole('button', { name: 'Register & Verify with OTP' }); await expect(submit).toBeDisabled(); await page.locator('#register-page-field-2').fill('Test Studio'); await submit.click(); await expect(page.getByRole('textbox', { name: 'Six-digit verification code' })).toBeVisible(); expect(submitted).toBe(true);
});
test('unsafe external login return destination is discarded', async ({ page }) => {
 await page.goto('/login?next=//evil.example');
 await expect(page.getByRole('link', { name: 'Create New Account' })).toHaveAttribute('href', '/register');
});
