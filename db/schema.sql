-- KKGS SaaS Database Schema (PostgreSQL)

CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id BIGINT NOT NULL REFERENCES roles(id),
  account_status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE admins (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position VARCHAR(50) NOT NULL CHECK (position IN ('bendahari', 'setiausaha', 'presiden', 'naib_presiden')),
  can_approve_payments BOOLEAN NOT NULL DEFAULT FALSE,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE members (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_no VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('guru', 'staf')),
  phone VARCHAR(30),
  join_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE fee_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('yuran_tetap', 'kutipan_khas')),
  description TEXT,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE collections (
  id BIGSERIAL PRIMARY KEY,
  fee_category_id BIGINT NOT NULL REFERENCES fee_categories(id),
  name VARCHAR(150) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  target_scope VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('aktif', 'tamat')),
  notes TEXT,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL REFERENCES members(id),
  collection_id BIGINT NOT NULL REFERENCES collections(id),
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_date DATE,
  method VARCHAR(30),
  status VARCHAR(30) NOT NULL CHECK (status IN ('belum_bayar', 'sebahagian_bayar', 'sudah_bayar', 'menunggu_semakan', 'ditolak')),
  reviewed_by BIGINT REFERENCES users(id),
  reviewed_at TIMESTAMP,
  remarks TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, collection_id)
);

CREATE TABLE payment_proofs (
  id BIGSERIAL PRIMARY KEY,
  payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  uploaded_by BIGINT REFERENCES users(id),
  verification_status VARCHAR(30) NOT NULL DEFAULT 'menunggu_semakan',
  rejection_reason TEXT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  related_payment_id BIGINT REFERENCES payments(id),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  published_by BIGINT REFERENCES users(id),
  published_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE activity_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id BIGINT REFERENCES users(id),
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT,
  metadata JSONB,
  ip_address VARCHAR(64),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_members_category ON members(category);
CREATE INDEX idx_collections_due_date ON collections(due_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_activity_logs_actor ON activity_logs(actor_user_id, created_at DESC);
