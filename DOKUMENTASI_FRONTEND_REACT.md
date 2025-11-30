# Dokumentasi Alur Frontend React (Slador)

Dokumen ini memahami struktur, alur data, serta kegunaan tiap script pada proyek frontend `fe/` yang dibangun dengan React + TypeScript. Fokus utama: cara aplikasi memanggil API backend, menerapkan proteksi role-based, dan mengelola state autentikasi.

---

## 1. Gambaran Umum

- Framework: React 18 + TypeScript, bundler Vite.
- Styling: Tailwind CSS (`src/index.css` berisi utilitas tambahan).
- State server: TanStack Query (`@tanstack/react-query`) via `QueryClientProvider`.
- Routing: React Router v6 (`BrowserRouter`, `Routes`, `Route`).
- Role yang didukung: `SISWA`, `GURU`, `ADMIN`.
- Fitur utama:
  - Halaman splash dengan pemilihan role.
  - Flow login terpisah per role.
  - Proteksi halaman menggunakan `ProtectedRoute`.
  - Layout terdedikasi per role (admin/teacher/student).
  - Konsumsi API backend via `lib/api.ts` (axios instance).
  - Manajemen state autentikasi di `AuthContext`.

---

## 2. Struktur Direktori Penting

```
fe/
├── src/
│   ├── App.tsx              # Definisi route global
│   ├── main.tsx             # Entry point React
│   ├── index.css            # Global styles + tailwind base
│   ├── context/
│   │   └── AuthContext.tsx  # State login + user
│   ├── lib/
│   │   └── api.ts           # Axios instance + interceptor token
│   ├── components/
│   │   └── ProtectedRoute.tsx  # Guard akses halaman
│   ├── layouts/
│   │   ├── AdminLayout.tsx
│   │   ├── TeacherLayout.tsx
│   │   └── StudentLayout.tsx
│   └── pages/
│       ├── SplashPage.tsx
│       ├── auth/
│       ├── student/
│       ├── teacher/
│       └── admin/
└── ...
```

Tambahan konfigurasi:
- `vite.config.ts`, `tsconfig.json`, dan `tailwind.config.js` mengatur alias path (`@/` → `src/`), compiler option, serta utilitas CSS.
- `.eslintrc.cjs` menampung aturan linting (React + TypeScript).

---

## 3. Alur Aplikasi (Dari `main.tsx` ke Halaman)

1. `src/main.tsx` merender `<App />` ke DOM di root `#root`.
2. `App.tsx` membuat `QueryClient` lalu membungkus seluruh aplikasi dengan:
   - `<QueryClientProvider>` → menyuplai TanStack Query.
   - `<AuthProvider>` → menyediakan context autentikasi.
   - `<BrowserRouter>` → mengaktifkan routing SPA.
3. `Routes` di dalam `App.tsx` mendefinisikan jalur publik (`/`, `/siswa/login`, `/guru/login`, `/admin/login`) dan jalur privat untuk tiap role.
4. `ProtectedRoute` digunakan pada jalur privat untuk:
   - Menunggu pemulihan state auth dari `localStorage`.
   - Mengecek token + user; jika tidak ada, redirect ke halaman login sesuai role.
   - Memastikan role user cocok dengan `allowedRoles`.
5. Layout (mis. `AdminLayout`) merender header/sidebar tetap dan menggunakan `<Outlet />` untuk halaman child (dashboard, laporan, pengaturan).

---

## 4. Detail Modul & Script

### 4.1 `context/AuthContext.tsx`

- Menyimpan state `user`, `accessToken`, `refreshToken`, dan `isLoading`.
- Saat mount, mengambil token & user dari `localStorage`.
- Fungsi `login(email, password)`:
  1. Memanggil `api.post('/api/auth/login', { email, password })`.
  2. Menyimpan token & data user ke `localStorage`.
  3. Mengupdate state context.
- Fungsi `logout()` menghapus token dari `localStorage` dan mereset state.
- `refreshUser()` memanggil `/api/auth/me` untuk sinkronisasi user terbaru (mis. setelah update profil).

Cara pakai di komponen: `const { user, login, logout } = useAuth()`.

### 4.2 `lib/api.ts`

- Membuat instance Axios dengan `baseURL` dari environment `VITE_API_BASE` (fallback `http://localhost:8000`).
- Interceptor request menambahkan header `Authorization: Bearer <token>` jika `access_token` tersedia di `localStorage`.
- Dipakai di seluruh aplikasi untuk panggilan API (contoh di halaman login, dashboard, dsb.).

### 4.3 `components/ProtectedRoute.tsx`

- Komponen wrapper yang menerima `allowedRoles` dan `redirectTo`.
- Menampilkan spinner loading ketika `AuthContext` masih loading.
- Jika belum login → redirect ke `redirectTo` atau `/`.
- Jika login tapi role tidak sesuai → redirect ke dashboard role yang cocok.
- Jika lolos semua cek → render `children`.

### 4.4 Layouts

| Layout | Fungsi |
|--------|--------|
| `AdminLayout.tsx` | Header + sidebar untuk admin (dashboard, manajemen, laporan, pengaturan). |
| `TeacherLayout.tsx` | (Jika ada) menyiapkan navigasi guru. |
| `StudentLayout.tsx` | (Jika ada) menyiapkan navigasi siswa. |

Catatan: Pada kode saat ini, route guru & siswa langsung merender halaman tanpa layout khusus; bisa di-refactor untuk menggunakan layout jika diperlukan.

### 4.5 Pages

#### Splash & Auth
- `SplashPage.tsx`: Halaman awal dengan pilihan role (link ke `/siswa/login`, `/guru/login`, `/admin/login`).
- `pages/auth/LoginPage.tsx`: Login siswa (bisa diadaptasi untuk role lain).
- `TeacherLoginPage.tsx`, `AdminLoginPage.tsx`: Login khusus role.

#### Student (`pages/student/`)

| File | Deskripsi Singkat |
|------|-------------------|
| `StudentDashboard.tsx` | Summary kehadiran (menggunakan TanStack Query untuk fetch statistik). |
| `StudentClassPage.tsx` | Daftar kelas yang diikuti. |
| `StudentScanPage.tsx` | Halaman scan QR (mengakses kamera via `navigator.mediaDevices`). |
| `StudentAttendanceHistory.tsx` | List riwayat presensi (fetch `/api/siswa/riwayat`). |
| `StudentAttendanceDetail.tsx` | Detail presensi tertentu (param `:id`). |
| `StudentProfilePage.tsx` | Form update profil / ganti password (pakai `useAuth().refreshUser`). |

#### Teacher (`pages/teacher/`)

| File | Deskripsi Singkat |
|------|-------------------|
| `TeacherDashboard.tsx` | Statistik kelas & sesi aktif. |
| `TeacherClassroomPage.tsx` | Kelola anggota kelas. |
| `TeacherSchedulePage.tsx` | Jadwal mengajar guru. |
| `TeacherSubjectPage.tsx` | CRUD mata pelajaran. |
| `TeacherAttendanceSystemPage.tsx` | Membuat sesi presensi + melihat daftar siswa hadir. |
| `TeacherHistoryPage.tsx` | Riwayat sesi presensi guru. |
| `TeacherSettingsPage.tsx` | Pengaturan akun guru. |

#### Admin (`pages/admin/`)

Semua halaman admin dirender di dalam `AdminLayout`.

| File | Deskripsi Singkat |
|------|-------------------|
| `AdminDashboard.tsx` | Statistik jumlah siswa/guru, total kehadiran hari ini, dll. |
| `AdminUserManagementPage.tsx` | CRUD user (menggunakan endpoint `/api/users`). |
| `AdminAttendanceReportPage.tsx` | Laporan kehadiran dengan filter tanggal/kelas. |
| `AdminSettingsPage.tsx` | Update pengaturan sekolah (`/api/admin/settings`). |

---

## 5. Alur Autentikasi & Proteksi Halaman

1. **Login**
   - Pengguna mengisi email & password → panggil `AuthContext.login`.
   - Jika sukses, navigasi diarahkan manual (misal `useNavigate`) sesuai role.
2. **Memuat Ulang Halaman**
   - Saat reload, `AuthProvider` mengambil token & user dari `localStorage`.
   - `ProtectedRoute` menunggu flag `isLoading` sebelum memutuskan redirect.
3. **Akses Route Privat**
   - Jika `user.role` termasuk dalam `allowedRoles`, halaman dirender.
   - Jika tidak, diarahkan ke dashboard role-nya masing-masing.
4. **Logout**
   - `logout()` memanggil `AuthContext.logout`, menghapus token, redirect ke `/`.

Diagram sederhana:

```
LoginForm -> AuthContext.login() -> simpan token -> navigate -> ProtectedRoute -> halaman role
```

---

## 6. Konsumsi API Backend

Semua request menggunakan helper `api`:

```ts
import api from '@/lib/api'

const { data } = await api.get('/api/guru/statistics')
```

Tips:
- Gunakan TanStack Query untuk caching (mis. `useQuery(['guruStats'], fetchFn)`).
- Untuk request yang butuh body (POST/PATCH), gunakan `api.post`, `api.patch`, dsb.
- Setelah memodifikasi data, invalidasi cache query TanStack Query agar data terbaru otomatis di-fetch.

---

## 7. Environment & Konfigurasi

File `.env` (buat di root `fe/`) contoh:

```
VITE_API_BASE=http://localhost:8000
```

Perintah penting:

| Perintah | Fungsi |
|----------|--------|
| `npm install` | Instal dependency. |
| `npm run dev` | Menjalankan dev server di `http://localhost:5173` (default Vite). |
| `npm run build` | Build production ke folder `dist/`. |
| `npm run preview` | Preview hasil build. |

---

## 8. Tips Pengembangan

- **Organisasi Kode**: pisahkan logika fetch/data di hooks custom (mis. `useStudentStats`) untuk memudahkan testing.
- **Pengelolaan Form**: gunakan `react-hook-form` + `zod` (sudah terinstal) untuk validasi konsisten.
- **UI Konsisten**: buat komponen UI ulang pakai Tailwind (mis. button, card) untuk menjaga konsistensi.
- **Testing API**: sinkronkan endpoint dengan dokumentasi backend (`DOKUMENTASI_BACKEND_PYTHON.md`).
- **Handling Token Kadaluarsa**: tambahkan interceptor response di `api.ts` untuk auto-refresh token menggunakan endpoint `/api/auth/refresh`.
- **Responsive**: gunakan kelas Tailwind untuk breakpoints (mobile-first). Periksa `README.md` untuk target lebar layar.

---

## 9. Langkah Lanjutan

- Tambah layout terpisah untuk guru & siswa bila ingin sidebar/menu konsisten.
- Implementasi guard tambahan agar user yang sudah login tidak bisa membuka halaman login (redirect otomatis).
- Tambahkan error boundary / feedback UI untuk request TanStack Query.
- Integrasikan service worker jika ingin mode offline/PNWA di masa depan.

Selamat membangun! Jika butuh referensi API lengkap, lihat dokumentasi backend dan file `lib/api.ts` sebagai titik masuk komunikasi frontend-backend.


