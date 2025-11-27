from django.db import models
from django.conf import settings
from apps.classes.models import Kelas, Jadwal, MataPelajaran


class SesiPresensi(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        AKTIF = "AKTIF", "Aktif"
        SELESAI = "SELESAI", "Selesai"

    kelas = models.ForeignKey(Kelas, on_delete=models.CASCADE, related_name="sesi_list")
    jadwal = models.ForeignKey(Jadwal, on_delete=models.SET_NULL, null=True, blank=True, related_name="sesi_list")
    mata_pelajaran = models.ForeignKey(
        MataPelajaran, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="sesi_list"
    )
    tanggal = models.DateField()
    window_mulai = models.DateTimeField(null=True, blank=True)
    window_selesai = models.DateTimeField(null=True, blank=True)
    qr_token = models.CharField(max_length=64, unique=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        mapel_str = f" - {self.mata_pelajaran.nama}" if self.mata_pelajaran else ""
        return f"Sesi {self.kelas.kode}{mapel_str} {self.tanggal} [{self.status}]"


class Presensi(models.Model):
    class Status(models.TextChoices):
        HADIR = "HADIR", "Hadir"
        TERLAMBAT = "TERLAMBAT", "Terlambat"
        IZIN = "IZIN", "Izin"
        SAKIT = "SAKIT", "Sakit"
        ALPHA = "ALPHA", "Alpha"

    sesi = models.ForeignKey(SesiPresensi, on_delete=models.CASCADE, related_name="presensi_list")
    siswa = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="presensi_siswa")
    waktu_scan = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.HADIR)
    

    class Meta:
        unique_together = ("sesi", "siswa")
        indexes = [
            models.Index(fields=["sesi"]),
        ]


class LogAudit(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="audit_actor")
    aksi = models.CharField(max_length=50)
    entitas = models.CharField(max_length=50)
    entitas_id = models.IntegerField()
    payload_json = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
