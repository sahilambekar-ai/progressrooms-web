(async function () {
  const account = document.getElementById('studio-account');
  if (!account) return;
  try {
    const token = localStorage.getItem('pr_access_token');
    if (!token) return;
    const res = await fetch(account.dataset.api + '/auth/me', { headers: { Authorization: 'Bearer ' + token } });
    if (!res.ok) return;
    const user = await res.json();
    account.href = user.role === 'STUDENT' ? '/student' : '/dashboard';
    account.textContent = (user.full_name || 'Me').charAt(0);
    account.title = (user.full_name || 'My account') + ' · My dashboard';
    account.setAttribute('aria-label', account.title);
    account.style.cssText = 'border-radius:50%;width:44px;height:44px;display:inline-grid;place-items:center;background:var(--ink);color:var(--paper);font-weight:bold;text-decoration:none';
  } catch (_) {}
})();
