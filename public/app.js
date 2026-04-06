async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Ralat permintaan API.');
  }
  return response.json();
}

function renderAnnouncements(target, announcements = []) {
  if (!target) {
    return;
  }

  target.innerHTML = announcements
    .map(
      (item) => `
      <article class="notice-item">
        <strong>${item.title}</strong>
        <p>${item.body}</p>
        <small>${item.publishedAt} • Keutamaan: ${item.priority}</small>
      </article>
    `
    )
    .join('');
}

async function initLanding() {
  const announcementList = document.querySelector('#announcement-list');
  if (!announcementList) {
    return;
  }

  const data = await fetchJSON('/api/public/landing');
  renderAnnouncements(announcementList, data.announcements);
}

async function initLogin() {
  const form = document.querySelector('#login-form');
  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = formData.get('email');

    try {
      const result = await fetchJSON('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      localStorage.setItem('kkgsUser', JSON.stringify(result.user));
      localStorage.setItem('kkgsPermissions', JSON.stringify(result.permissions));
      window.location.href = 'dashboard.html';
    } catch (error) {
      alert(error.message);
    }
  });
}

function metricCard(label, value) {
  return `<article class="metric"><p>${label}</p><strong>${value}</strong></article>`;
}

async function initDashboard() {
  const table = document.querySelector('#payment-table');
  if (!table) {
    return;
  }

  const user = JSON.parse(localStorage.getItem('kkgsUser') || 'null');
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  document.querySelector('#welcome-title').textContent = `Selamat datang, ${user.name}`;
  document.querySelector('#welcome-subtitle').textContent = `Peranan: ${user.role}`;
  document.querySelector('#sidebar-role').textContent = user.role.toUpperCase();

  const metricsContainer = document.querySelector('#metrics');

  try {
    if (['super_admin', 'presiden'].includes(user.role)) {
      const analytics = await fetchJSON('/api/dashboard/analytics', {
        headers: { 'x-role': user.role }
      });

      metricsContainer.innerHTML = [
        metricCard('Jumlah Ahli', analytics.totalMembers),
        metricCard('Kutipan Aktif', analytics.activeCollections),
        metricCard('Bayaran Diterima (RM)', analytics.totalPaid),
        metricCard('Jumlah Tunggakan (RM)', analytics.outstanding),
        metricCard('Kadar Ahli Sudah Bayar', `${analytics.paymentRate}%`)
      ].join('');

      const members = await fetchJSON('/api/members', { headers: { 'x-role': 'presiden' } }).catch(
        async () => fetchJSON('/api/members', { headers: { 'x-role': 'bendahari' } })
      );

      table.innerHTML = members
        .map(
          (member) => `
          <tr>
            <td>${member.name}</td>
            <td>Yuran Tahunan KKGS 2026</td>
            <td><span class="status menunggu_semakan">Menunggu Semakan</span></td>
            <td>2026-04-30</td>
            <td>RM120.00</td>
          </tr>`
        )
        .join('');
    } else {
      const summary = await fetchJSON(`/api/member/${user.id}/summary`);

      metricsContainer.innerHTML = [
        metricCard('Jumlah Yuran Semasa (RM)', summary.currentFees),
        metricCard('Jumlah Tertunggak (RM)', summary.totalOutstanding),
        metricCard('Status Terkini', summary.latestStatus.replaceAll('_', ' ')),
        metricCard('Bil. Bayaran Tertunggak', summary.pending.length)
      ].join('');

      table.innerHTML = summary.pending
        .map(
          (item) => `
        <tr>
          <td>${summary.member.name}</td>
          <td>${item.collectionName}</td>
          <td><span class="status ${item.status}">${item.status.replaceAll('_', ' ')}</span></td>
          <td>${item.dueDate}</td>
          <td>RM${item.outstanding.toFixed(2)}</td>
        </tr>`
        )
        .join('');

      renderAnnouncements(document.querySelector('#dashboard-notices'), summary.notices);
      return;
    }

    const landing = await fetchJSON('/api/public/landing');
    renderAnnouncements(document.querySelector('#dashboard-notices'), landing.announcements);
  } catch (error) {
    table.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
  }
}

initLanding();
initLogin();
initDashboard();
