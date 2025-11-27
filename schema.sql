-- =============================================================================
-- SLADOR Backend Database Schema
-- Generated from Django migrations
-- Database: PostgreSQL
-- =============================================================================

-- Drop tables if exists (optional, for clean install)
-- DROP TABLE IF EXISTS attendance_presensi CASCADE;
-- DROP TABLE IF EXISTS attendance_sesipresensi CASCADE;
-- DROP TABLE IF EXISTS attendance_logaudit CASCADE;
-- DROP TABLE IF EXISTS classes_siswakelas CASCADE;
-- DROP TABLE IF EXISTS classes_jadwal CASCADE;
-- DROP TABLE IF EXISTS classes_kelas CASCADE;
-- DROP TABLE IF EXISTS users_user_user_permissions CASCADE;
-- DROP TABLE IF EXISTS users_user_groups CASCADE;
-- DROP TABLE IF EXISTS users_user CASCADE;

-- =============================================================================
-- USERS APP TABLES
-- =============================================================================

-- Table: users_user
-- Custom user model extending Django's AbstractUser
CREATE TABLE users_user (
    id BIGSERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE NULL,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL DEFAULT '',
    role VARCHAR(10) NOT NULL DEFAULT 'SISWA' CHECK (role IN ('ADMIN', 'GURU', 'SISWA'))
);

-- Create indexes for users_user
CREATE INDEX users_user_username_idx ON users_user(username);
CREATE INDEX users_user_email_idx ON users_user(email);
CREATE INDEX users_user_role_idx ON users_user(role);

-- Table: users_user_groups (Many-to-Many relationship with auth_group)
CREATE TABLE users_user_groups (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
    UNIQUE(user_id, group_id)
);

CREATE INDEX users_user_groups_user_id_idx ON users_user_groups(user_id);
CREATE INDEX users_user_groups_group_id_idx ON users_user_groups(group_id);

-- Table: users_user_user_permissions (Many-to-Many relationship with auth_permission)
CREATE TABLE users_user_user_permissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
    UNIQUE(user_id, permission_id)
);

CREATE INDEX users_user_user_permissions_user_id_idx ON users_user_user_permissions(user_id);
CREATE INDEX users_user_user_permissions_permission_id_idx ON users_user_user_permissions(permission_id);

-- =============================================================================
-- CLASSES APP TABLES
-- =============================================================================

-- Table: classes_kelas
CREATE TABLE classes_kelas (
    id BIGSERIAL PRIMARY KEY,
    kode VARCHAR(30) NOT NULL UNIQUE,
    nama VARCHAR(120) NOT NULL,
    tahun_ajaran VARCHAR(20) NOT NULL,
    tingkat VARCHAR(10) NOT NULL DEFAULT 'X',
    wali_guru_id BIGINT NULL REFERENCES users_user(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX classes_kelas_kode_idx ON classes_kelas(kode);
CREATE INDEX classes_kelas_wali_guru_id_idx ON classes_kelas(wali_guru_id);
CREATE INDEX classes_kelas_tahun_ajaran_idx ON classes_kelas(tahun_ajaran);

-- Table: classes_jadwal
CREATE TABLE classes_jadwal (
    id BIGSERIAL PRIMARY KEY,
    mapel VARCHAR(120) NOT NULL,
    hari VARCHAR(15) NOT NULL,
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    ruang VARCHAR(50) NOT NULL DEFAULT '',
    kelas_id BIGINT NOT NULL REFERENCES classes_kelas(id) ON DELETE CASCADE
);

CREATE INDEX classes_jadwal_kelas_id_idx ON classes_jadwal(kelas_id);
CREATE INDEX classes_jadwal_hari_idx ON classes_jadwal(hari);

-- Table: classes_siswakelas
-- Represents many-to-many relationship between students and classes
CREATE TABLE classes_siswakelas (
    id BIGSERIAL PRIMARY KEY,
    tgl_gabung DATE NOT NULL DEFAULT CURRENT_DATE,
    siswa_id BIGINT NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    kelas_id BIGINT NOT NULL REFERENCES classes_kelas(id) ON DELETE CASCADE,
    UNIQUE(siswa_id, kelas_id)
);

CREATE INDEX classes_siswakelas_siswa_id_idx ON classes_siswakelas(siswa_id);
CREATE INDEX classes_siswakelas_kelas_id_idx ON classes_siswakelas(kelas_id);

-- =============================================================================
-- ATTENDANCE APP TABLES
-- =============================================================================

-- Table: attendance_sesipresensi
-- Represents an attendance session for a class
CREATE TABLE attendance_sesipresensi (
    id BIGSERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    window_mulai TIMESTAMP WITH TIME ZONE NULL,
    window_selesai TIMESTAMP WITH TIME ZONE NULL,
    qr_token VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(10) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'AKTIF', 'SELESAI')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    kelas_id BIGINT NOT NULL REFERENCES classes_kelas(id) ON DELETE CASCADE,
    jadwal_id BIGINT NULL REFERENCES classes_jadwal(id) ON DELETE SET NULL
);

CREATE INDEX attendance_sesipresensi_kelas_id_idx ON attendance_sesipresensi(kelas_id);
CREATE INDEX attendance_sesipresensi_jadwal_id_idx ON attendance_sesipresensi(jadwal_id);
CREATE INDEX attendance_sesipresensi_qr_token_idx ON attendance_sesipresensi(qr_token);
CREATE INDEX attendance_sesipresensi_tanggal_idx ON attendance_sesipresensi(tanggal);
CREATE INDEX attendance_sesipresensi_status_idx ON attendance_sesipresensi(status);

-- Table: attendance_presensi
-- Individual attendance records for students
CREATE TABLE attendance_presensi (
    id BIGSERIAL PRIMARY KEY,
    waktu_scan TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR(10) NOT NULL DEFAULT 'HADIR' CHECK (status IN ('HADIR', 'TERLAMBAT', 'SAKIT', 'ALPHA')),
    sesi_id BIGINT NOT NULL REFERENCES attendance_sesipresensi(id) ON DELETE CASCADE,
    siswa_id BIGINT NOT NULL REFERENCES users_user(id) ON DELETE CASCADE,
    UNIQUE(sesi_id, siswa_id)
);

CREATE INDEX attendance_presensi_sesi_id_idx ON attendance_presensi(sesi_id);
CREATE INDEX attendance_presensi_siswa_id_idx ON attendance_presensi(siswa_id);
CREATE INDEX attendance_presensi_status_idx ON attendance_presensi(status);

-- Table: attendance_logaudit
-- Audit log for tracking actions in the system
CREATE TABLE attendance_logaudit (
    id BIGSERIAL PRIMARY KEY,
    aksi VARCHAR(50) NOT NULL,
    entitas VARCHAR(50) NOT NULL,
    entitas_id INTEGER NOT NULL,
    payload_json JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    actor_id BIGINT NULL REFERENCES users_user(id) ON DELETE SET NULL
);

CREATE INDEX attendance_logaudit_actor_id_idx ON attendance_logaudit(actor_id);
CREATE INDEX attendance_logaudit_entitas_idx ON attendance_logaudit(entitas);
CREATE INDEX attendance_logaudit_created_at_idx ON attendance_logaudit(created_at);

-- =============================================================================
-- COMMENTS
-- =============================================================================

-- Users table comments
COMMENT ON TABLE users_user IS 'Tabel pengguna sistem (Admin, Guru, Siswa)';
COMMENT ON COLUMN users_user.role IS 'Role pengguna: ADMIN, GURU, atau SISWA';

-- Classes table comments
COMMENT ON TABLE classes_kelas IS 'Tabel kelas/rombongan belajar';
COMMENT ON TABLE classes_jadwal IS 'Tabel jadwal pelajaran per kelas';
COMMENT ON TABLE classes_siswakelas IS 'Tabel relasi siswa dengan kelas (many-to-many)';
COMMENT ON COLUMN classes_kelas.tingkat IS 'Tingkat kelas: X, XI, XII';

-- Attendance table comments
COMMENT ON TABLE attendance_sesipresensi IS 'Tabel sesi presensi (dibuka oleh guru)';
COMMENT ON TABLE attendance_presensi IS 'Tabel record presensi siswa';
COMMENT ON TABLE attendance_logaudit IS 'Tabel audit log untuk tracking aktivitas sistem';

-- =============================================================================
-- SAMPLE DATA (Optional)
-- =============================================================================

-- Uncomment below to insert sample data

-- Insert sample admin user
-- INSERT INTO users_user (username, email, name, role, password, is_staff, is_superuser) 
-- VALUES ('admin', 'admin@slador.sch.id', 'Administrator', 'ADMIN', 'pbkdf2_sha256$...', TRUE, TRUE);

-- Insert sample teacher
-- INSERT INTO users_user (username, email, name, role, password) 
-- VALUES ('guru001', 'guru001@slador.sch.id', 'Budi Santoso', 'GURU', 'pbkdf2_sha256$...');

-- Insert sample student
-- INSERT INTO users_user (username, email, name, role, password) 
-- VALUES ('siswa001', 'siswa001@slador.sch.id', 'Ahmad Wijaya', 'SISWA', 'pbkdf2_sha256$...');

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================

