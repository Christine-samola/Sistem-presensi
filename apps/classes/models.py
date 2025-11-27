from django.db import models
from django.conf import settings
from django.utils import timezone


class MataPelajaran(models.Model):
    """Model untuk Mata Pelajaran"""
    kode = models.CharField(max_length=20, unique=True)
    nama = models.CharField(max_length=100)
    deskripsi = models.TextField(blank=True)
    guru = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="mata_pelajaran_diampu",
        limit_choices_to={'role': 'GURU'}
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Mata Pelajaran"
        verbose_name_plural = "Mata Pelajaran"
        ordering = ['nama']

    def __str__(self) -> str:
        return f"{self.kode} - {self.nama}"


class Kelas(models.Model):
    kode = models.CharField(max_length=30, unique=True, blank=True)
    nama = models.CharField(max_length=120)
    tingkat = models.CharField(max_length=10, default='X')  # X, XI, XII
    tahun_ajaran = models.CharField(max_length=20)
    wali_guru = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="kelas_wali")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Auto generate kode if empty
        if not self.kode:
            import random
            import string
            self.kode = f"K{self.tingkat}{''.join(random.choices(string.digits, k=4))}"
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.nama} - Kelas {self.tingkat}"


class SiswaKelas(models.Model):
    siswa = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="keanggotaan_kelas")
    kelas = models.ForeignKey(Kelas, on_delete=models.CASCADE, related_name="anggota")
    tgl_gabung = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("siswa", "kelas")


class Jadwal(models.Model):
    """Model untuk Jadwal Pelajaran"""
    HARI_CHOICES = [
        ('Senin', 'Senin'),
        ('Selasa', 'Selasa'),
        ('Rabu', 'Rabu'),
        ('Kamis', 'Kamis'),
        ('Jumat', 'Jumat'),
        ('Sabtu', 'Sabtu'),
        ('Minggu', 'Minggu'),
    ]
    
    kelas = models.ForeignKey(Kelas, on_delete=models.CASCADE, related_name="jadwal_list")
    mata_pelajaran = models.ForeignKey(
        MataPelajaran, 
        on_delete=models.CASCADE, 
        related_name="jadwal_list",
        null=True,  # Temporary for migration
        blank=True
    )
    # Keep old field for backward compatibility during migration
    mapel = models.CharField(max_length=120, blank=True)
    hari = models.CharField(max_length=15, choices=HARI_CHOICES)
    jam_mulai = models.TimeField()
    jam_selesai = models.TimeField()
    ruang = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ['hari', 'jam_mulai']
        verbose_name = "Jadwal"
        verbose_name_plural = "Jadwal"

    def __str__(self) -> str:
        mapel_name = self.mata_pelajaran.nama if self.mata_pelajaran else self.mapel
        return f"{self.kelas.kode} - {mapel_name} ({self.hari} {self.jam_mulai}-{self.jam_selesai})"
