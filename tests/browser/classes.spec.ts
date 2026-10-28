import { test, expect, auth } from './fixtures';
test('private appointment: table, correct editor, email and deletion', async ({ page }, testInfo) => {
  await auth(page);
  let removed = false;
  const appointment = { id: 'appointment', name: 'Private yoga', session_type: 'ONE_TO_ONE', is_active: true,
    capacity: 1, pricing: { pricing_type: 'PER_SESSION', total_classes: 1, price: 0, currency: 'INR' },
    instructors: [{ id: 'teacher', member_id: 'teacher', full_name: 'Teacher' }],
    assigned_student_user_id: 'student', assigned_student: { id: 'student', name: 'Student', email: 'student@example.test' },
    occurrences: [{ id: 'occurrence', start_at: '2099-01-10T04:30:00Z', end_at: '2099-01-10T05:30:00Z', status: 'SCHEDULED' }] };
  await page.route('**/api/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (request.method() === 'DELETE') { removed = true; return route.fulfill({ status: 204 }); }
    if (request.method() === 'PUT') { appointment.name = request.postDataJSON().title; return route.fulfill({ json: { id: appointment.id } }); }
    if (path.endsWith('/send-invite')) return route.fulfill({ json: { message: 'Invitation queued through Zoom Mail.' } });
    if (path.includes('teacher-agenda')) return route.fulfill({ json: { day: 'today', timezone: 'Asia/Kolkata', classes: removed ? [] : [{ ...appointment.occurrences[0], name: appointment.name, email_deliveries: { SENT: 2 }, is_current: false }] } });
    if (request.url().includes('history=true')) return route.fulfill({ json: [] });
    if (path.endsWith('/classes')) return route.fulfill({ json: removed ? [] : [appointment] });
    if (path.endsWith('/members')) return route.fulfill({ json: [{ id: 'teacher', full_name: 'Teacher', role: 'TEACHER', can_teach: true, is_active: true }] });
    if (path.endsWith('/students')) return route.fulfill({ json: { items: [] } });
    return route.fulfill({ status: 500, json: { detail: `Unexpected ${path}` } });
  });
  await page.goto('http://127.0.0.1:3111/?view=classes');
  const table = page.getByRole('table', { name: /today’s classes/ });
  await expect(table).toBeVisible();
  await expect(table.getByRole('columnheader', { name: 'Email' })).toBeVisible();
  await expect(page.getByText(/Setup needed|Not connected/)).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('class-table.png'), fullPage: true });
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit 1-on-1 Class' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel(/Select Student/)).toHaveValue('student');
  await expect(dialog.getByLabel(/Assigned Teacher/)).toHaveValue('teacher');
  await expect(dialog.getByLabel(/Session Date/)).toHaveValue('2099-01-10');
  await dialog.getByLabel(/Class Title/).fill('Edited private yoga');
  await page.screenshot({ path: testInfo.outputPath('appointment-editor.png'), fullPage: true });
  const save = page.waitForRequest(r => r.method() === 'PUT' && r.url().endsWith('/one-on-one-classes/appointment'));
  await dialog.getByRole('button', { name: 'Update 1-on-1 Class' }).click();
  expect((await save).postDataJSON()).toMatchObject({ title: 'Edited private yoga', student_user_id: 'student', date: '2099-01-10', start_time: '10:00', end_time: '11:00', price: 0 });
  await expect(dialog).toHaveCount(0);
  await table.getByRole('button', { name: 'Send invite' }).click();
  await expect(table.getByText('Invitation queued through Zoom Mail.')).toBeVisible();
  await page.getByRole('button', { name: 'Delete Edited private yoga' }).click();
  await page.getByRole('button', { name: 'Delete class', exact: true }).click();
  await expect(table).toHaveCount(0);
  await expect(page.getByText('No classes scheduled today.')).toBeVisible();
});
