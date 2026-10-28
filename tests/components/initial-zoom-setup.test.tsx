import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { InitialZoomSetup } from '@/components/InitialZoomSetup';
import { staffApi } from '@/lib/staff-api';
import { openMeetingTab } from '@/lib/meeting-window';
vi.mock('@/lib/staff-api', () => ({ staffApi: vi.fn() }));
vi.mock('@/lib/meeting-window', () => ({ openMeetingTab: vi.fn(async load => load()) }));
vi.mock('@/lib/zoom-refresh', () => ({ useZoomRefresh: vi.fn() }));
it('connects Zoom without requiring a host ID', async () => {
  vi.mocked(staffApi).mockImplementation(async path => {
    if (path.endsWith('/settings')) return { teachers: [{ id: 'owner', is_owner: true }], provider_mode: 'live' };
    if (path.endsWith('/host-key')) return { host_key_configured: false };
    return { authorization_url: 'https://zoom.us/oauth/authorize' };
  });
  render(<InitialZoomSetup org="studio" onConnected={vi.fn()} />);
  const connect = screen.getByRole('button', { name: 'Connect Zoom' });
  await waitFor(() => expect(connect).toBeEnabled());
  expect(screen.queryByLabelText('Zoom Host ID')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Zoom host key', { exact: true })).toBeDisabled();
  fireEvent.click(connect);
  await waitFor(() => expect(staffApi).toHaveBeenCalledWith('/organizations/studio/teachers/owner/zoom/connect', { method: 'POST' }));
  expect(openMeetingTab).toHaveBeenCalledOnce();
  await waitFor(() => expect(connect).toBeEnabled());
  fireEvent.click(connect);
  await waitFor(() => expect(openMeetingTab).toHaveBeenCalledTimes(2));
  expect(vi.mocked(staffApi).mock.calls.filter(([path]) => path.endsWith('/zoom/connect'))).toHaveLength(2);
});
