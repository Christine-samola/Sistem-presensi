from rest_framework import serializers
from .models import SesiPresensi, Presensi
from apps.classes.serializers import MataPelajaranSerializer, KelasSerializer


class SesiPresensiSerializer(serializers.ModelSerializer):
    mata_pelajaran_detail = MataPelajaranSerializer(source="mata_pelajaran", read_only=True)
    kelas_detail = KelasSerializer(source="kelas", read_only=True)
    
    class Meta:
        model = SesiPresensi
        fields = [
            "id",
            "kelas",
            "kelas_detail",
            "jadwal",
            "mata_pelajaran",
            "mata_pelajaran_detail",
            "tanggal",
            "window_mulai",
            "window_selesai",
            "qr_token",
            "status",
            "created_at",
        ]
        read_only_fields = ["qr_token", "status", "created_at"]


class PresensiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presensi
        fields = ["id", "sesi", "siswa", "waktu_scan", "status"]
        read_only_fields = ["waktu_scan"]
