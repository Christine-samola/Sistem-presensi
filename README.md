## Slador Backend (Django)

Persyaratan:
- Python 3.11 atau 3.12 (jangan 3.13, ada masalah kompatibilitas dengan psycopg2-binary)
- PostgreSQL 13+

Setup cepat:

```bash
# dari folder be

# 1. Buat virtual environment
python -m venv .venv

# 2. Aktifkan virtual environment
# macOS/Linux:
source .venv/bin/activate
# Windows (Git Bash/WSL):
# . .venv/Scripts/activate
# Windows PowerShell:
# .venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Buat database PostgreSQL
psql -U postgres -h 127.0.0.1 -p 5432 -c "CREATE DATABASE slador;"
# atau gunakan file SQL:
# psql -U postgres -h 127.0.0.1 -p 5432 -f create_database.sql

# 5. Set environment variables (pakai variabel OS atau buat file .env)
# macOS/Linux:
export DJANGO_SECRET_KEY=change_me
export DEBUG=True
export POSTGRES_DB=slador
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=123QWEasdzxc
export POSTGRES_HOST=127.0.0.1
export POSTGRES_PORT=5432
# Windows:
# set DJANGO_SECRET_KEY=change_me
# set DEBUG=True
# (dan seterusnya...)

# 6. Jalankan migrasi database
python manage.py makemigrations
python manage.py migrate

# 7. Buat superuser (admin)
python manage.py createsuperuser

# 8. (Opsional) Generate data dummy untuk development
python manage.py seed_all --clear --with-jadwal

# 9. Jalankan server
python manage.py runserver 0.0.0.0:8000
```

## Data Seeding (Development)

Generate data dummy untuk testing dan development:

```bash
# Generate semua data (users + kelas + jadwal)
python manage.py seed_all --clear --with-jadwal

# Generate users saja
python manage.py seed_users --admin 2 --guru 10 --siswa 50 --password password123

# Generate kelas saja
python manage.py seed_classes --kelas 5 --tahun 2024/2025 --with-jadwal

# Hapus data lama sebelum seeding
python manage.py seed_all --clear
```

**Login credentials setelah seeding:**
- Admin: `admin1@slador.com` / `password123`
- Guru: `guru1@slador.com` / `password123`
- Siswa: `siswa1@slador.com` / `password123`

Endpoint utama:
- POST `/api/auth/login` → { email, password }
- POST `/api/auth/refresh` → { refresh_token }
- GET/PATCH `/api/auth/me`
- PATCH `/api/auth/me/password`
- Kelas: `/api/kelas`, Jadwal: `/api/jadwal`
- Sesi: `/api/sesi` (POST buat sesi), `/api/sesi/{id}/aktif` (PATCH aktifkan)
- Scan: POST `/api/scan` → { token }

Catatan:
- Gunakan header: `Authorization: Bearer <access_token>`
- `qr_token` ditampilkan pada response pembuatan sesi, gunakan untuk QR payload `https://<host>/scan?token=<qr_token>` atau panggil POST `/api/scan` body `{ token }`.
