import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { StudioClasses } from '@/components/StudioClasses';
import { FeedbackProvider } from '@/components/FeedbackProvider';
import { TeacherZoomControl } from '@/components/TeacherZoomControl';
import { staffApi } from '@/lib/staff-api';
vi.mock('@/lib/staff-api', () => ({ staffApi: vi.fn() }));
const appointment = {
  id: 'appointment', name: 'Private yoga', session_type: 'ONE_TO_ONE', is_active: true,
  pricing: { pricing_type: 'PER_SESSION', total_classes: 1, price: 0, currency: 'INR' },
  instructors: [{ id: 'teacher', member_id: 'teacher', full_name: 'Teacher' }],
  assigned_student_user_id: 'student', assigned_student: { id: 'student', name: 'Student', email: 'student@example.test' },
  occurrences: [{ id: 'occurrence', start_at: '2099-01-10T04:30:00Z', end_at: '2099-01-10T05:30:00Z', status: 'SCHEDULED' }],
};
let deleted = false;
beforeEach(() => {
  deleted = false;
  vi.mocked(staffApi).mockReset().mockImplementation(async (path, options) => {
    if (options?.method === 'DELETE') { deleted = true; return; }
    if (options?.method === 'PUT') return { id: 'appointment' };
    if (path.endsWith('/send-invite')) return { message: 'Invitation queued through Zoom Mail.' };
    if (path.includes('teacher-agenda')) return { day: 'today', timezone: 'Asia/Kolkata', classes: deleted ? [] : [{ ...appointment.occurrences[0], name: appointment.name, email_deliveries: { SENT: 2 }, is_current: false }] };
    if (path.includes('history=true')) return [];
    if (path.endsWith('/classes')) return deleted ? [] : [appointment];
    if (path.endsWith('/members')) return [{ id: 'teacher', full_name: 'Teacher', role: 'TEACHER', can_teach: true, is_active: true }];
    if (path.startsWith('/students')) return { items: [] }; // Assigned student can be outside the first directory page.
    if (path.endsWith('/zoom')) return { zoom_connection_status: 'ACTIVE', zoom_verified_email: 'host@example.test' };
    throw new Error(`Unexpected API request ${path}`);
  });
});
function renderClasses() { return render(<FeedbackProvider><StudioClasses orgId="studio" /></FeedbackProvider>); }
it('uses a compact agenda table, reports email status and sends invitations', async () => {
  renderClasses();
  const table = await screen.findByRole('table', { name: /today’s classes/ });
  expect(within(table).getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
  expect(within(table).getByText('sent: 2')).toBeInTheDocument();
  expect(screen.queryByText(/Setup needed|Checking Zoom|Zoom setup available/)).not.toBeInTheDocument();
  fireEvent.click(within(table).getByRole('button', { name: 'Send invite' }));
  expect(await screen.findByText('Invitation queued through Zoom Mail.')).toBeInTheDocument();
});
it('edits an appointment with its assigned student and local date instead of the batch form', async () => {
  renderClasses();
  fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
  const dialog = await screen.findByRole('dialog', { name: 'Edit 1-on-1 Class' });
  expect(within(dialog).queryByText('Edit Class Batch')).not.toBeInTheDocument();
  expect(within(dialog).getByLabelText(/Select Student/)).toHaveValue('student');
  expect(within(dialog).getByLabelText(/Assigned Teacher/)).toHaveValue('teacher');
  fireEvent.change(within(dialog).getByLabelText(/Class Title/), { target: { value: 'Edited appointment' } });
  fireEvent.submit(dialog.querySelector('form')!);
  await waitFor(() => expect(staffApi).toHaveBeenCalledWith('/organizations/studio/one-on-one-classes/appointment', expect.objectContaining({ method: 'PUT' })));
  const call = vi.mocked(staffApi).mock.calls.find(([path, options]) => path.endsWith('/appointment') && options?.method === 'PUT');
  expect(JSON.parse(call![1]!.body as string)).toMatchObject({ title: 'Edited appointment', student_user_id: 'student', teacher_member_id: 'teacher', date: '2099-01-10', start_time: '10:00', end_time: '11:00', price: 0 });
});
it('refreshes the agenda immediately after deletion', async () => {
  renderClasses();
  await screen.findByRole('table');
  fireEvent.click(await screen.findByRole('button', { name: 'Delete Private yoga' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Delete class' }));
  await waitFor(() => expect(screen.queryByRole('table')).not.toBeInTheDocument());
  expect(await screen.findByText('No classes scheduled today.')).toBeInTheDocument();
});
it('loads the saved Zoom connection before displaying its status', async () => {
  render(<FeedbackProvider><TeacherZoomControl org="studio" member="teacher" name="Teacher" userId="teacher-user" /></FeedbackProvider>);
  expect(screen.queryByText(/Not connected|Setup needed/)).not.toBeInTheDocument();
  expect(await screen.findByRole('button', { name: 'Connected · host@example.test' })).toBeInTheDocument();
});
