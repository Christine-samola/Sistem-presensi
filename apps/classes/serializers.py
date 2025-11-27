from rest_framework import serializers
from .models import Kelas, SiswaKelas, Jadwal, MataPelajaran
from apps.users.serializers import UserSerializer


class MataPelajaranSerializer(serializers.ModelSerializer):
    guru_detail = UserSerializer(source="guru", read_only=True)
    
    class Meta:
        model = MataPelajaran
        fields = ["id", "kode", "nama", "deskripsi", "guru", "guru_detail", "is_active", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class KelasSerializer(serializers.ModelSerializer):
    wali_guru_detail = UserSerializer(source="wali_guru", read_only=True)

    class Meta:
        model = Kelas
        fields = ["id", "kode", "nama", "tingkat", "tahun_ajaran", "wali_guru", "wali_guru_detail", "created_at"]
        read_only_fields = ["kode", "created_at"]


class SiswaKelasSerializer(serializers.ModelSerializer):
    siswa_detail = UserSerializer(source="siswa", read_only=True)

    class Meta:
        model = SiswaKelas
        fields = ["id", "siswa", "kelas", "tgl_gabung", "siswa_detail"]


class JadwalSerializer(serializers.ModelSerializer):
    mata_pelajaran_detail = MataPelajaranSerializer(source="mata_pelajaran", read_only=True)
    kelas_detail = KelasSerializer(source="kelas", read_only=True)
    mapel_nama = serializers.SerializerMethodField()
    
    class Meta:
        model = Jadwal
        fields = [
            "id", "kelas", "kelas_detail", "mata_pelajaran", "mata_pelajaran_detail",
            "mapel", "mapel_nama", "hari", "jam_mulai", "jam_selesai", "ruang",
            "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]
    
    def get_mapel_nama(self, obj):
        """Get mata pelajaran name from either mata_pelajaran FK or mapel CharField"""
        if obj.mata_pelajaran:
            return obj.mata_pelajaran.nama
        return obj.mapel or ""
