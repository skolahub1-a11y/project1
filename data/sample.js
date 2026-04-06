const roles = {
  SUPER_ADMIN: 'super_admin',
  BENDAHARI: 'bendahari',
  SU: 'setiausaha',
  PRESIDEN: 'presiden',
  NAIB_PRESIDEN: 'naib_presiden',
  GURU: 'guru',
  STAF: 'staf'
};

const users = [
  { id: 1, name: 'Super Admin KKGS', email: 'superadmin@kkgs.edu.my', role: roles.SUPER_ADMIN },
  { id: 2, name: 'Pn. Siti Bendahari', email: 'bendahari@kkgs.edu.my', role: roles.BENDAHARI },
  { id: 3, name: 'En. Faiz Guru', email: 'faiz@kkgs.edu.my', role: roles.GURU },
  { id: 4, name: 'Pn. Aina Staf', email: 'aina@kkgs.edu.my', role: roles.STAF }
];

const collections = [
  {
    id: 1,
    name: 'Yuran Tahunan KKGS 2026',
    category: 'yuran_tetap',
    amount: 120,
    startDate: '2026-01-01',
    dueDate: '2026-04-30',
    target: 'semua_ahli',
    status: 'aktif',
    notes: 'Bayaran tahunan wajib untuk semua ahli.'
  },
  {
    id: 2,
    name: 'Sumbangan Hari Keluarga',
    category: 'kutipan_khas',
    amount: 40,
    startDate: '2026-03-01',
    dueDate: '2026-04-20',
    target: 'guru_dan_staf',
    status: 'aktif',
    notes: 'Kutipan khas program hari keluarga sekolah.'
  }
];

const payments = [
  {
    id: 1,
    memberId: 3,
    collectionId: 1,
    paidAmount: 120,
    status: 'sudah_bayar',
    proofStatus: 'disahkan',
    paidAt: '2026-02-15'
  },
  {
    id: 2,
    memberId: 4,
    collectionId: 1,
    paidAmount: 60,
    status: 'sebahagian_bayar',
    proofStatus: 'menunggu_semakan',
    paidAt: '2026-03-10'
  },
  {
    id: 3,
    memberId: 4,
    collectionId: 2,
    paidAmount: 0,
    status: 'belum_bayar',
    proofStatus: 'tiada',
    paidAt: null
  }
];

const announcements = [
  {
    id: 1,
    title: 'Notis Bayaran Yuran Tahunan',
    body: 'Sila jelaskan yuran tahunan sebelum 30 April 2026 untuk elak tunggakan.',
    priority: 'tinggi',
    publishedAt: '2026-04-01'
  },
  {
    id: 2,
    title: 'Program Hari Keluarga KKGS',
    body: 'Kutipan khas RM40 dibuka sehingga 20 April 2026.',
    priority: 'sederhana',
    publishedAt: '2026-03-28'
  }
];

module.exports = {
  roles,
  users,
  collections,
  payments,
  announcements
};
