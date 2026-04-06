const express = require('express');
const path = require('path');
const { roles, users, collections, payments, announcements } = require('./data/sample');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const rolePermissions = {
  [roles.SUPER_ADMIN]: [
    'manage_admins',
    'manage_members',
    'manage_collections',
    'approve_payments',
    'view_reports',
    'view_analytics'
  ],
  [roles.BENDAHARI]: ['view_members', 'update_payments', 'manage_collections', 'send_notices', 'export_reports'],
  [roles.SU]: ['view_members', 'update_payments', 'send_notices', 'export_reports'],
  [roles.PRESIDEN]: ['view_members', 'view_reports', 'view_analytics'],
  [roles.NAIB_PRESIDEN]: ['view_members', 'view_reports'],
  [roles.GURU]: ['view_own_dashboard', 'upload_payment_proof', 'download_receipt'],
  [roles.STAF]: ['view_own_dashboard', 'upload_payment_proof', 'download_receipt']
};

function authorize(requiredPermission) {
  return (req, res, next) => {
    const role = req.headers['x-role'];
    if (!role || !rolePermissions[role]) {
      return res.status(401).json({ message: 'Peranan tidak sah atau tiada.' });
    }

    if (!rolePermissions[role].includes(requiredPermission)) {
      return res.status(403).json({ message: 'Akses tidak dibenarkan.' });
    }

    req.role = role;
    next();
  };
}

function computeAnalytics() {
  const activeCollections = collections.filter((c) => c.status === 'aktif').length;
  const totalMembers = users.filter((u) => [roles.GURU, roles.STAF].includes(u.role)).length;

  const totalPaid = payments.reduce((sum, payment) => sum + payment.paidAmount, 0);

  const outstanding = payments.reduce((sum, payment) => {
    const collection = collections.find((c) => c.id === payment.collectionId);
    if (!collection) {
      return sum;
    }
    return sum + Math.max(0, collection.amount - payment.paidAmount);
  }, 0);

  const uniqueFullyPaid = new Set(
    payments.filter((p) => p.status === 'sudah_bayar').map((p) => p.memberId)
  ).size;

  const paymentRate = totalMembers === 0 ? 0 : Math.round((uniqueFullyPaid / totalMembers) * 100);

  return {
    totalMembers,
    activeCollections,
    totalPaid,
    outstanding,
    paymentRate,
    monthlyCollection: [
      { month: 'Jan', amount: 120 },
      { month: 'Feb', amount: 340 },
      { month: 'Mar', amount: 280 },
      { month: 'Apr', amount: 150 }
    ],
    programComparison: collections.map((collection) => {
      const paidForCollection = payments
        .filter((payment) => payment.collectionId === collection.id)
        .reduce((sum, payment) => sum + payment.paidAmount, 0);
      return {
        program: collection.name,
        paid: paidForCollection,
        target: collection.amount
      };
    })
  };
}

app.get('/api/public/landing', (req, res) => {
  res.json({
    organization: {
      name: 'Kelab Kebajikan Guru dan Staf (KKGS)',
      tagline: 'Sistem Pengurusan Yuran & Kutipan KKGS'
    },
    highlights: [
      'Semakan yuran ahli secara masa nyata',
      'Pengurusan kutipan khas berstruktur',
      'Rekod transaksi dan audit trail tersusun',
      'Notifikasi automatik bayaran dan tunggakan'
    ],
    announcements
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: 'Emel tidak dijumpai.' });
  }

  return res.json({
    token: `mock-token-${user.id}`,
    user,
    permissions: rolePermissions[user.role]
  });
});

app.get('/api/dashboard/analytics', authorize('view_analytics'), (req, res) => {
  res.json(computeAnalytics());
});

app.get('/api/members', authorize('view_members'), (req, res) => {
  const members = users.filter((u) => [roles.GURU, roles.STAF].includes(u.role));
  res.json(members);
});

app.get('/api/member/:id/summary', (req, res) => {
  const memberId = Number(req.params.id);
  const member = users.find((u) => u.id === memberId);

  if (!member || ![roles.GURU, roles.STAF].includes(member.role)) {
    return res.status(404).json({ message: 'Ahli tidak ditemui.' });
  }

  const memberPayments = payments.filter((p) => p.memberId === memberId);

  const pending = memberPayments
    .filter((p) => ['belum_bayar', 'sebahagian_bayar', 'menunggu_semakan'].includes(p.status))
    .map((payment) => {
      const collection = collections.find((c) => c.id === payment.collectionId);
      return {
        paymentId: payment.id,
        collectionName: collection?.name,
        dueDate: collection?.dueDate,
        status: payment.status,
        outstanding: Math.max((collection?.amount || 0) - payment.paidAmount, 0)
      };
    });

  const currentFees = memberPayments.reduce((sum, payment) => {
    const collection = collections.find((c) => c.id === payment.collectionId);
    return sum + (collection?.amount || 0);
  }, 0);

  const totalPaid = memberPayments.reduce((sum, payment) => sum + payment.paidAmount, 0);

  const totalOutstanding = Math.max(currentFees - totalPaid, 0);

  res.json({
    member,
    currentFees,
    totalOutstanding,
    latestStatus: memberPayments[memberPayments.length - 1]?.status || 'belum_bayar',
    pending,
    paymentHistory: memberPayments,
    notices: announcements
  });
});

app.listen(PORT, () => {
  console.log(`KKGS SaaS berjalan di http://localhost:${PORT}`);
});
