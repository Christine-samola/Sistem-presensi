from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from datetime import date

from .models import Kelas, SiswaKelas, Jadwal, MataPelajaran
from .serializers import KelasSerializer, SiswaKelasSerializer, JadwalSerializer, MataPelajaranSerializer
from apps.users.permissions import IsAdmin, IsGuru
from apps.attendance.models import SesiPresensi


class MataPelajaranViewSet(viewsets.ModelViewSet):
    """ViewSet for Mata Pelajaran management"""
    queryset = MataPelajaran.objects.all().order_by("-id")
    serializer_class = MataPelajaranSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        qs = super().get_queryset()
        
        # Filter by current user if guru
        if self.request.user.role == 'GURU':
            qs = qs.filter(Q(guru=self.request.user) | Q(guru__isnull=True))
        
        # Filter by guru_id if provided
        guru_id = self.request.query_params.get('guru_id')
        if guru_id:
            qs = qs.filter(guru_id=guru_id)
        
        # Filter by is_active if provided
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        
        return qs
    
    def perform_create(self, serializer):
        # Auto-assign guru to current user if guru and no guru specified
        if self.request.user.role == 'GURU' and not serializer.validated_data.get('guru'):
            serializer.save(guru=self.request.user)
        else:
            serializer.save()


class KelasViewSet(viewsets.ModelViewSet):
    queryset = Kelas.objects.all().order_by("-id")
    serializer_class = KelasSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy", "anggota"]:
            return [permissions.IsAuthenticated(),]
        return [permissions.IsAuthenticated(),]

    def get_queryset(self):
        qs = super().get_queryset()
        guru_id = self.request.query_params.get("guru_id")
        siswa_id = self.request.query_params.get("siswa_id")
        
        # Filter by current user if guru
        if self.request.user.role == 'GURU':
            qs = qs.filter(wali_guru=self.request.user)
        # Filter by current user if siswa
        elif self.request.user.role == 'SISWA':
            qs = qs.filter(anggota__siswa=self.request.user).distinct()
        elif guru_id:
            qs = qs.filter(Q(wali_guru_id=guru_id) | Q(anggota__siswa_id=guru_id, anggota__siswa__role="GURU")).distinct()
        elif siswa_id:
            qs = qs.filter(anggota__siswa_id=siswa_id).distinct()
        
        return qs
    
    def perform_create(self, serializer):
        # Auto-assign wali_guru to current user if guru
        if self.request.user.role == 'GURU':
            serializer.save(wali_guru=self.request.user)
        else:
            serializer.save()
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Add jumlah_siswa to response
        result = []
        for kelas in queryset:
            data = self.get_serializer(kelas).data
            data['jumlah_siswa'] = kelas.anggota.count()
            data['guru_nama'] = kelas.wali_guru.name if kelas.wali_guru else None
            result.append(data)
        
        return Response(result)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = self.get_serializer(instance).data
        
        # Add siswa list to detail response
        siswa_kelas = SiswaKelas.objects.filter(kelas=instance).select_related('siswa')
        data['anggota'] = SiswaKelasSerializer(siswa_kelas, many=True).data
        data['jumlah_siswa'] = siswa_kelas.count()
        data['guru_nama'] = instance.wali_guru.name if instance.wali_guru else None
        
        return Response(data)

    @action(detail=True, methods=["post"])
    def anggota(self, request, pk=None):
        kelas = self.get_object()
        serializer = SiswaKelasSerializer(data={"kelas": kelas.id, **request.data})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=["get"])
    def available_students(self, request, pk=None):
        """Get list of students not yet in this class"""
        from apps.users.models import User
        from apps.users.serializers import UserSerializer
        
        kelas = self.get_object()
        # Get students already in this class
        students_in_class = SiswaKelas.objects.filter(kelas=kelas).values_list('siswa_id', flat=True)
        # Get all students not in this class
        available_students = User.objects.filter(
            role=User.Role.SISWA,
            is_active=True
        ).exclude(id__in=students_in_class)
        
        serializer = UserSerializer(available_students, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=["delete", "post"])
    def remove_student(self, request, pk=None):
        """Remove a student from class"""
        kelas = self.get_object()
        
        # Try to get siswa_id from both request.data and request.query_params
        siswa_id = request.data.get('siswa_id') or request.query_params.get('siswa_id')
        
        if not siswa_id:
            return Response({
                'error': 'siswa_id required',
                'detail': 'Provide siswa_id in request body or query params',
                'received_data': request.data,
                'received_params': dict(request.query_params)
            }, status=400)
        
        try:
            siswa_kelas = SiswaKelas.objects.get(kelas=kelas, siswa_id=siswa_id)
            siswa_kelas.delete()
            return Response({'message': 'Student removed from class'})
        except SiswaKelas.DoesNotExist:
            return Response({'error': 'Student not found in this class'}, status=404)


class JadwalViewSet(viewsets.ModelViewSet):
    queryset = Jadwal.objects.all().order_by("-id")
    serializer_class = JadwalSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related('kelas')
        kelas_id = self.request.query_params.get("kelas_id")
        guru_id = self.request.query_params.get("guru_id")
        
        if kelas_id:
            qs = qs.filter(kelas_id=kelas_id)
        if guru_id:
            qs = qs.filter(kelas__wali_guru_id=guru_id)
        
        # Filter by current user if guru
        if self.request.user.role == 'GURU':
            qs = qs.filter(kelas__wali_guru=self.request.user)
        
        return qs
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Enhanced response with kelas info
        result = []
        for jadwal in queryset:
            data = self.get_serializer(jadwal).data
            data['kelas_id'] = jadwal.kelas.id
            data['kelas_nama'] = f"{jadwal.mapel} {jadwal.kelas.nama}"
            data['ruangan'] = jadwal.ruang
            result.append(data)
        
        return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def guru_statistics(request):
    """Get statistics for guru dashboard"""
    user = request.user
    
    # Total kelas yang diajar
    total_kelas = Kelas.objects.filter(wali_guru=user).count()
    
    # Total siswa di semua kelas
    total_siswa = SiswaKelas.objects.filter(
        kelas__wali_guru=user
    ).values('siswa').distinct().count()
    
    # Jadwal hari ini
    today = date.today()
    hari_mapping = {
        0: 'Senin',
        1: 'Selasa',
        2: 'Rabu',
        3: 'Kamis',
        4: 'Jumat',
        5: 'Sabtu',
        6: 'Minggu'
    }
    hari_ini = hari_mapping.get(today.weekday(), 'Senin')
    jadwal_hari_ini = Jadwal.objects.filter(
        kelas__wali_guru=user,
        hari=hari_ini
    ).count()
    
    # Sesi aktif
    sesi_aktif = SesiPresensi.objects.filter(
        kelas__wali_guru=user,
        status=SesiPresensi.Status.AKTIF
    ).count()
    
    return Response({
        'totalKelas': total_kelas,
        'totalSiswa': total_siswa,
        'jadwalHariIni': jadwal_hari_ini,
        'sesiAktif': sesi_aktif
    })
