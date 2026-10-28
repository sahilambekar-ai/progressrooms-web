import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PasswordInput } from '../../src/components/PasswordInput';
import { OtpVerificationCard } from '../../src/components/OtpVerificationCard';
import { StoreCheckout } from '../../src/components/StoreCheckout';
import { SaaSBilling } from '../../src/components/SaaSBilling';
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const offering = { id: 'class-1', kind: 'class' as const, name: 'Yoga', price: 0, currency: 'INR' };
const summary = { studio_name: 'Test studio', plan_name: 'Starter', access: { state: 'TRIAL' }, checkout_available: true, enforcement_enabled: true, purchases: [], plans: [{ id: 'core', name: 'Core', slug: 'core', base_paise: 10000, interval: 'MONTHLY' }] };
const quote = { plan_id: 'core', plan_name: 'Core', currency: 'INR', base_paise: 10000, platform_fee_paise: 200, gst_paise: 1836, total_paise: 12036, gst_bps: 1800 };
describe('account controls', () => {
 it('reveals without changing the exact password and respects disabled state', async () => {
  const user = userEvent.setup(); const { rerender } = render(<PasswordInput aria-label="Secret" defaultValue=" long password " />);
  const input = screen.getByLabelText('Secret'); expect(input).toHaveAttribute('type', 'password');
  await user.click(screen.getByRole('button', { name: 'Show password' }));
  expect(input).toHaveAttribute('type', 'text'); expect(input).toHaveValue(' long password ');
  rerender(<PasswordInput aria-label="Secret" disabled />); expect(screen.getByRole('button')).toBeDisabled();
 });
 it('does not expose preview OTP outside developer mode; rejects bad code then succeeds', async () => {
  const user = userEvent.setup(); const onSuccess = vi.fn(); const fetcher = vi.fn().mockResolvedValueOnce(reply({ detail: 'Invalid code' }, 400)).mockResolvedValueOnce(reply({ access_token: 'verified', user: { role: 'STUDENT' } })); vi.stubGlobal('fetch', fetcher);
  render(<OtpVerificationCard email="student@example.test" previewOtp="654321" onSuccess={onSuccess} purpose="LOGIN_VERIFICATION" />);
  expect(screen.queryByText(/Test Passcode/)).not.toBeInTheDocument();
  await user.type(screen.getByRole('textbox'), '123456'); await user.click(screen.getByRole('button', { name: /Verify & Open/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid code'); expect(onSuccess).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: /Verify & Open/ })); await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ email: 'student@example.test', otp: '123456', purpose: 'LOGIN_VERIFICATION' });
 });
});
describe('purchase confirmation', () => {
 it('retains failed confirmation and retries without creating a second order', async () => {
  localStorage.setItem('pr_access_token', 'student-token'); const user = userEvent.setup();
  const fetcher = vi.fn().mockResolvedValueOnce(reply({ free: true, order_id: 'order-1', razorpay_order_id: 'free-1' })).mockResolvedValueOnce(reply({ detail: 'Confirmation pending' }, 503)).mockResolvedValueOnce(reply({ status: 'ACTIVE' })); vi.stubGlobal('fetch', fetcher);
  render(<StoreCheckout offering={offering} onClose={() => {}} />);
  await user.click(screen.getByRole('button', { name: 'Confirm free enrollment' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Confirmation pending'); expect(sessionStorage.length).toBe(1);
  expect(screen.queryByText('Purchase complete')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Retry payment confirmation' }));
  expect(await screen.findByText('Purchase complete')).toBeInTheDocument(); expect(sessionStorage.length).toBe(0);
  expect(fetcher.mock.calls.filter(c => c[0].endsWith('/commerce/orders'))).toHaveLength(1);
  expect(fetcher.mock.calls[1][1].headers.Authorization).toBe('Bearer student-token');
 });
 it('restores a pending confirmation after remount', async () => {
  localStorage.setItem('pr_access_token', 'student-token');
  sessionStorage.setItem('pr_payment_recovery_class_class-1_default', JSON.stringify({ order: { order_id: 'old' }, payment: { razorpay_payment_id: 'paid' } }));
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ status: 'ACTIVE' })));
  render(<StoreCheckout offering={offering} onClose={() => {}} />);
  await userEvent.click(await screen.findByRole('button', { name: 'Retry payment confirmation' }));
  expect(await screen.findByText('Purchase complete')).toBeInTheDocument();
 });
 it('displays denied purchase errors without claiming activation', async () => {
  localStorage.setItem('pr_access_token', 'student'); vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ detail: 'Not allowed' }, 403)));
  render(<StoreCheckout offering={offering} onClose={() => {}} />); await userEvent.click(screen.getByRole('button', { name: 'Confirm free enrollment' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Not allowed'); expect(screen.queryByText('Purchase complete')).toBeNull();
 });
});
describe('subscription billing', () => {
 it('requires location and fresh pricing consent; changing country clears the quote', async () => {
  const user = userEvent.setup(); const fetcher = vi.fn().mockImplementation((url: string) => Promise.resolve(reply(url.endsWith('/quote') ? quote : summary))); vi.stubGlobal('fetch', fetcher);
  render(<SaaSBilling orgId="studio-1" />);
  await user.click(await screen.findByRole('button', { name: 'Review Core plan' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Select your billing location'); expect(fetcher).toHaveBeenCalledTimes(1);
  await user.selectOptions(screen.getByRole('combobox'), 'IN'); await user.click(screen.getByRole('button', { name: 'Review Core plan' }));
  const pay = await screen.findByRole('button', { name: /Pay .*Razorpay/ }); expect(pay).toBeDisabled();
  await user.click(screen.getByRole('checkbox')); expect(pay).toBeEnabled();
  await user.selectOptions(screen.getByRole('combobox'), 'OTHER'); expect(screen.queryByRole('button', { name: /Pay .*Razorpay/ })).toBeNull();
 });
 it('shows authorization failure without rendering billing actions', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ detail: 'Owner access required' }, 403)));
  render(<SaaSBilling orgId="foreign-studio" />); expect(await screen.findByRole('alert')).toHaveTextContent('Owner access required'); expect(screen.queryByRole('combobox')).toBeNull();
 });
});
