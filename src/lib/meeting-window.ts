/** Reserve the tab during the click so async API calls cannot trigger popup blocking. */
export async function openMeetingTab(load: () => Promise<string>) {
  const tab = window.open('about:blank', '_blank');
  if (!tab) throw new Error('Allow new tabs for Progress Rooms, then try again.');
  tab.opener = null;
  try {
    const url = await load();
    const target = new URL(url, window.location.origin);
    if (!['https:', 'http:'].includes(target.protocol)) throw new Error('Invalid meeting or authorization link.');
    tab.location.replace(target.href);
  } catch (error) {
    tab.close();
    throw error;
  }
}

export function studioToday(timeZone = 'Asia/Kolkata') {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = (type: string) => parts.find(part => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}
