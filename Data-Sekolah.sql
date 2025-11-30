-- Active: 1758024615389@@127.0.0.1@5432@sistem_presensi@public

CREATE TYPE "JenisKelamin" AS ENUM('pria','wanita');
CREATE TYPE "AlasanTidakHadir" AS ENUM('sakit', 'izin', 'alpha');

CREATE TABLE "Guru" (
    "kode_guru" VARCHAR(7) PRIMARY KEY,
    "nama_lengkap" VARCHAR(35) NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "bidang_keahlian" VARCHAR(20) NOT NULL,
    "email" VARCHAR(35) NOT NULL,
    "password" VARCHAR(6) NOT NULL
);

CREATE TABLE "Kelas" (
    "kode_kelas" VARCHAR(10) PRIMARY KEY,
    "nama" VARCHAR(35) NOT NULL,
    "kode_wali_kelas" VARCHAR(8) UNIQUE REFERENCES "Guru" ("kode_guru") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Siswa" (
    "nomor_induk" VARCHAR(10) PRIMARY KEY,
    "nama_lengkap" VARCHAR (35) NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "kode_kelas_penempatan" VARCHAR(10) REFERENCES "Kelas" ("kode_kelas") ON DELETE SET NULL ON UPDATE CASCADE,
    "email" VARCHAR(35) NOT NULL,
    "password" VARCHAR(6) NOT NULL
);
--Membuat data siswa
-- Pastikan sudah ada tabel Jenis_Kelamin sebagai referensi
-- Contoh:
-- CREATE TABLE "Jenis_Kelamin" (
--   "kode_jenis_kelamin" VARCHAR PRIMARY KEY,
--   "nama_jenis_kelamin" VARCHAR
-- );
-- INSERT INTO "Jenis_Kelamin" VALUES ('pria', 'Laki-laki'), ('wanita', 'Perempuan');

-- Ubah definisi tabel Siswa agar Jenis_Kelamin menjadi foreign key
-- Contoh:
-- CREATE TABLE "Siswa" (
--   "nomor_induk" VARCHAR PRIMARY KEY,
--   "nama_lengkap" VARCHAR,
--   "kode_jenis_kelamin" VARCHAR REFERENCES "Jenis_Kelamin"("kode_jenis_kelamin"),
--   "kode_kelas_penempatan" VARCHAR REFERENCES "Kelas"("kode_kelas"),
--   "Email" VARCHAR
-- );

-- Perbaiki query insert agar menggunakan kode_jenis_kelamin

CREATE TABLE "Kehadiran" (
    "kehadiran_id" SERIAL PRIMARY KEY,
    "tanggal" DATE NOT NULL,
    "kode_kelas" VARCHAR (10) NOT NULL REFERENCES "Kelas" ("kode_kelas") ON DELETE SET NULL ON UPDATE CASCADE,
    "kode_wali_kelas" VARCHAR (8) NOT NULL REFERENCES "Guru" ("kode_guru") ON DELETE SET NULL ON UPDATE CASCADE,
    "tahun_ajaran" VARCHAR (15) NOT NULL 
);
CREATE TABLE "SiswaKehadiran" (
    "sesi_id" SERIAL PRIMARY KEY,
    "kehadiran_id" INT REFERENCES "Kehadiran" ("kehadiran_id") ON DELETE CASCADE,
    "nomor_induk_siswa" VARCHAR (10) REFERENCES "Siswa" ("nomor_induk") ON DELETE CASCADE ON UPDATE CASCADE,
    "hadir" BOOLEAN, 
    "alasan_tidak_hadir" "AlasanTidakHadir"
);
