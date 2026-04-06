# KKGS SaaS — Sistem Pengurusan Yuran & Kutipan

Web app SaaS moden untuk **Kelab Kebajikan Guru dan Staf (KKGS)** dengan 2 komponen utama:
1. Landing page awam.
2. Dashboard mengikut peranan (Super Admin, Admin, Ahli).

## 1) Penerangan Lengkap Sistem

Sistem ini direka untuk mengurus keseluruhan kitaran kutipan:
- Cipta kategori yuran/kutipan (tetap atau khas).
- Tetapkan amaun, tarikh mula, tarikh akhir, sasaran ahli.
- Jejak pembayaran dan status (belum bayar, sebahagian bayar, sudah bayar, menunggu semakan, ditolak).
- Muat naik bukti pembayaran dan semakan admin.
- Notifikasi automatik berkaitan bayaran baharu, tunggakan, pengesahan, penolakan.
- Laporan dan analitik kutipan (jumlah diterima, tunggakan, kadar bayaran ahli).

## 2) Senarai Modul

1. **Landing Page Awam**
   - Hero premium, CTA log masuk admin/ahli, ringkasan fungsi, notis, footer organisasi.
2. **Auth & RBAC**
   - Mock login + role-based access control.
3. **Pengurusan Pengguna**
   - Super Admin urus admin dan ahli.
4. **Modul Kutipan**
   - Yuran tetap + kutipan khas, amaun, due date, sasaran, status.
5. **Modul Pembayaran**
   - Rekod bayaran, status bayaran, upload bukti.
6. **Notifikasi & Pengumuman**
   - Broadcast notis dan peringatan automatik.
7. **Laporan & Analitik**
   - KPI utama dan jadual sokongan.
8. **Audit Trail**
   - Aktiviti pengguna dan perubahan data.

## 3) Struktur Database

Rujuk fail penuh: `db/schema.sql`.

### Jadual utama
- `roles` → definisi role sistem.
- `users` → akaun asas dan status.
- `admins` → profil pentadbir + jawatan organisasi.
- `members` → data ahli (guru/staf).
- `fee_categories` → kategori yuran/kutipan.
- `collections` → item kutipan dengan amaun, tarikh, sasaran.
- `payments` → rekod bayaran per ahli & kutipan.
- `payment_proofs` → bukti pembayaran.
- `notifications` → notifikasi sistem.
- `announcements` → pengumuman umum.
- `activity_logs` → audit trail.

### Hubungan utama
- `users.role_id -> roles.id`
- `admins.user_id -> users.id`
- `members.user_id -> users.id`
- `collections.fee_category_id -> fee_categories.id`
- `payments.member_id -> members.id`
- `payments.collection_id -> collections.id`
- `payment_proofs.payment_id -> payments.id`
- `notifications.user_id -> users.id`

## 4) User Flow

1. Pengguna buka `Landing Page`.
2. Klik `Log Masuk Admin` atau `Log Masuk Ahli`.
3. Login berjaya → redirect ke `Dashboard`.
4. Sistem baca role:
   - **Super Admin**: urus admin, ahli, kutipan, laporan penuh.
   - **Admin**: urus bayaran, kutipan, notis, laporan ringkas.
   - **Ahli**: semak yuran, tunggakan, sejarah, upload bukti.
5. Notifikasi dipaparkan berdasarkan event bayaran.

## 5) Senarai Page Diperlukan

- `/index.html` — landing awam.
- `/login.html` — log masuk demo.
- `/dashboard.html` — dashboard berasaskan role.

Cadangan jika dikembangkan:
- `/dashboard/admins`
- `/dashboard/members`
- `/dashboard/collections`
- `/dashboard/payments`
- `/dashboard/reports`
- `/dashboard/notifications`
- `/dashboard/settings`

## 6) Cadangan UI Dashboard

### Konsep visual
- Clean corporate style + glassmorphism ringan.
- Warna profesional (biru navy, putih, kelabu lembut).
- Sidebar kiri + top summary cards + panel jadual.

### Komponen utama
- **Sidebar**: modul utama + role badge.
- **KPI Cards**: jumlah ahli, kutipan aktif, bayaran diterima, tunggakan.
- **Smart Table**: senarai kutipan/bayaran dengan status berwarna.
- **Notice Panel**: notis penting organisasi.
- **Status Color**:
  - Merah: belum bayar / ditolak
  - Kuning: sebahagian / menunggu semakan
  - Hijau: sudah bayar

## 7) Prompt Coding Penuh (Boleh Guna Semula)

Gunakan prompt ini untuk sambung binaan production-ready:

```text
Bina SaaS KKGS menggunakan React + Node.js + PostgreSQL.
Keperluan:
1) Landing page premium mobile-first.
2) Auth JWT + refresh token + RBAC (super admin, admin: bendahari/SU/presiden/naib presiden, ahli: guru/staf).
3) Modul kutipan (yuran tetap + kutipan khas) dengan tarikh mula/akhir, sasaran ahli, status aktif/tamat.
4) Modul pembayaran dengan status: belum_bayar, sebahagian_bayar, sudah_bayar, menunggu_semakan, ditolak.
5) Upload bukti pembayaran ke object storage.
6) Dashboard analytics: total ahli, kutipan aktif, total paid, tunggakan, payment rate, chart bulanan, per program.
7) Notifikasi automatik (email/in-app): bayaran baru, due date hampir, disahkan, ditolak.
8) Eksport laporan PDF/Excel/CSV.
9) Activity log lengkap untuk audit.
10) UI moden dengan sidebar, cards, table filter (status/program/bulan/tahun), dark mode optional.
Sediakan:
- struktur folder,
- migrasi SQL,
- endpoint REST lengkap,
- seed data,
- ujian unit/integrasi asas,
- deployment docker-compose.
```

## 8) Implementasi Dalam Repo Ini (Contoh Siap)

### Frontend
- Landing page, login, dashboard role-based: folder `public/`.

### Backend
- API Express untuk login, dashboard analytics, members list, member summary: `server.js`.

### Database schema
- SQL relational lengkap: `db/schema.sql`.

### Auth role
- RBAC middleware dengan permission map di `server.js`.

### Contoh dashboard admin & ahli
- Admin/super admin: metrik analitik + senarai ahli.
- Ahli: jumlah yuran, tunggakan, status semasa, senarai bayaran pending + notis.

## Cara Jalankan

```bash
npm install
npm run dev
```

Buka: `http://localhost:3000`
