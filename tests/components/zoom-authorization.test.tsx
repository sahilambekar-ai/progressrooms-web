import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ZoomAuthorizationLanding } from '@/components/ZoomAuthorizationLanding';
import { staffApi } from '@/lib/staff-api';
vi.mock('@/lib/staff-api', () => ({ staffApi: vi.fn() }));

it('offers a fresh authorization after an expired callback without replaying it', async () => {
  localStorage.setItem('pr_access_token', 'test-token');
  window.history.replaceState({}, '', '/integrations/zoom/callback?state=old-state&code=old-code');
  vi.mocked(staffApi).mockRejectedValueOnce(new Error('Authorization link expired or already used'));
  render(<ZoomAuthorizationLanding />);
  fireEvent.click(await screen.findByRole('button', { name: 'Verify authorized account' }));
  const restart = await screen.findByRole('button', { name: 'Create new Zoom authorization link' });
  vi.mocked(staffApi).mockRejectedValueOnce(new Error('Return to your studio to start again'));
  fireEvent.click(restart);
  await waitFor(() => expect(staffApi).toHaveBeenLastCalledWith('/integrations/zoom/restart', {
    method: 'POST', body: JSON.stringify({ state: 'old-state', kind: 'OAUTH' }),
  }));
  expect(await screen.findByRole('status')).toHaveTextContent('Return to your studio to start again');
});
