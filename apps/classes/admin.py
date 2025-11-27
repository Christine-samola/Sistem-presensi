from django.contrib import admin
from .models import MataPelajaran, Kelas, SiswaKelas, Jadwal


@admin.register(MataPelajaran)
class MataPelajaranAdmin(admin.ModelAdmin):
    list_display = ['kode', 'nama', 'guru', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['kode', 'nama', 'deskripsi']
    ordering = ['nama']


@admin.register(Kelas)
class KelasAdmin(admin.ModelAdmin):
    list_display = ['kode', 'nama', 'tingkat', 'tahun_ajaran', 'wali_guru', 'created_at']
    list_filter = ['tingkat', 'tahun_ajaran']
    search_fields = ['kode', 'nama']
    ordering = ['-created_at']


@admin.register(SiswaKelas)
class SiswaKelasAdmin(admin.ModelAdmin):
    list_display = ['siswa', 'kelas', 'tgl_gabung']
    list_filter = ['tgl_gabung']
    search_fields = ['siswa__name', 'kelas__nama']
    ordering = ['-tgl_gabung']


@admin.register(Jadwal)
class JadwalAdmin(admin.ModelAdmin):
    list_display = ['kelas', 'mata_pelajaran', 'hari', 'jam_mulai', 'jam_selesai', 'ruang']
    list_filter = ['hari', 'created_at']
    search_fields = ['kelas__nama', 'mata_pelajaran__nama', 'ruang']
    ordering = ['hari', 'jam_mulai']

