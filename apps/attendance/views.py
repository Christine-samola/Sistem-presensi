import secrets
from datetime import datetime, timezone, date

from django.utils import timezone as dj_tz
from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SesiPresensi, Presensi
from .serializers import SesiPresensiSerializer, PresensiSerializer
from apps.classes.models import Kelas, SiswaKelas
from apps.users.permissions import IsGuru, IsSiswa
from apps.users.models import User


class SesiViewSet(viewsets.ModelViewSet):
    queryset = SesiPresensi.objects.all().order_by("-id")
    serializer_class = SesiPresensiSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Generate unique token
        qr_token = secrets.token_urlsafe(24)
        now = dj_tz.now()
        
        # Create sesi directly (bypass serializer for token generation)
        kelas_id = request.data.get('kelas')
        mata_pelajaran_id = request.data.get('mata_pelajaran')
        jadwal_id = request.data.get('jadwal')
        
        if not kelas_id:
            return Response({"detail": "kelas required"}, status=400)
        
        try:
            kelas = Kelas.objects.get(id=kelas_id)
        except Kelas.DoesNotExist:
            return Response({"detail": "kelas not found"}, status=404)
        
        # Get mata_pelajaran if provided
        mata_pelajaran = None
        if mata_pelajaran_id:
            from apps.classes.models import MataPelajaran
            try:
                mata_pelajaran = MataPelajaran.objects.get(id=mata_pelajaran_id)
            except MataPelajaran.DoesNotExist:
                return Response({"detail": "mata_pelajaran not found"}, status=404)
        
        # Get jadwal if provided
        jadwal = None
        if jadwal_id:
            from apps.classes.models import Jadwal
            try:
                jadwal = Jadwal.objects.get(id=jadwal_id)
                # Auto-set mata_pelajaran from jadwal if not provided
                if not mata_pelajaran and jadwal.mata_pelajaran:
                    mata_pelajaran = jadwal.mata_pelajaran
            except Jadwal.DoesNotExist:
                pass
        
        # Create sesi
        sesi = SesiPresensi.objects.create(
            kelas=kelas,
            jadwal=jadwal,
            mata_pelajaran=mata_pelajaran,
            qr_token=qr_token,
            status=SesiPresensi.Status.AKTIF,
            tanggal=date.today(),
            window_mulai=now,
            window_selesai=now + dj_tz.timedelta(hours=1)
        )
        
        # Build response
        response_data = {
            'id': sesi.id,
            'kelas': sesi.kelas_id,
            'jadwal': sesi.jadwal_id,
            'mata_pelajaran': sesi.mata_pelajaran_id,
            'mata_pelajaran_nama': sesi.mata_pelajaran.nama if sesi.mata_pelajaran else None,
            'qr_token': sesi.qr_token,
            'status': sesi.status,
            'tanggal': sesi.tanggal,
            'window_mulai': sesi.window_mulai,
            'window_selesai': sesi.window_selesai,
            'created_at': sesi.created_at,
            'jumlah_hadir': 0,
            'kelas_nama': sesi.kelas.nama,
            'waktu_mulai': sesi.window_mulai,
            'waktu_selesai': sesi.window_selesai
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated])
    def aktif(self, request, pk=None):
        sesi = self.get_object()
        window_mulai = request.data.get("window_mulai")
        window_selesai = request.data.get("window_selesai")
        if not (window_mulai and window_selesai):
            return Response({"detail": "window_mulai & window_selesai required"}, status=400)
        sesi.window_mulai = window_mulai
        sesi.window_selesai = window_selesai
        sesi.status = SesiPresensi.Status.AKTIF
        sesi.save(update_fields=["window_mulai", "window_selesai", "status"])
        return Response(self.get_serializer(sesi).data)
    
    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated])
    def selesai(self, request, pk=None):
        """End active session"""
        sesi = self.get_object()
        sesi.status = SesiPresensi.Status.SELESAI
        sesi.save(update_fields=["status"])
        return Response(self.get_serializer(sesi).data)
    
    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def daftar_siswa(self, request, pk=None):
        """Get list of students in this session with their attendance status"""
        sesi = self.get_object()
        
        # Get all students in this kelas
        siswa_kelas = SiswaKelas.objects.filter(kelas=sesi.kelas).select_related('siswa')
        
        result = []
        for sk in siswa_kelas:
            # Check if student already has attendance record
            presensi = Presensi.objects.filter(sesi=sesi, siswa=sk.siswa).first()
            
            result.append({
                'siswa_id': sk.siswa.id,
                'nama': sk.siswa.name,
                'nim': getattr(sk.siswa, 'nim', None),
                'email': sk.siswa.email,
                'status': presensi.status if presensi else None,
                'waktu_scan': presensi.waktu_scan if presensi else None,
                'sudah_presensi': presensi is not None
            })
        
        return Response(result)
    
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def manual_presensi(self, request, pk=None):
        """Manually record attendance for a student"""
        sesi = self.get_object()
        siswa_id = request.data.get('siswa_id')
        status = request.data.get('status', 'HADIR')
        
        if not siswa_id:
            return Response({
                'error': 'siswa_id required',
                'detail': 'Provide siswa_id in request body',
                'endpoint': f'/api/sesi/{pk}/manual_presensi/',
                'received_data': request.data
            }, status=400)
        
        # Validate status
        valid_statuses = [s[0] for s in Presensi.Status.choices]
        if status not in valid_statuses:
            return Response({'error': f'Invalid status. Must be one of: {valid_statuses}'}, status=400)
        
        try:
            siswa = User.objects.get(id=siswa_id)
        except User.DoesNotExist:
            return Response({'error': 'Siswa not found'}, status=404)
        
        # Check if siswa is in this kelas
        if not SiswaKelas.objects.filter(kelas=sesi.kelas, siswa=siswa).exists():
            return Response({'error': 'Siswa not in this class'}, status=403)
        
        # Create or update presensi
        presensi, created = Presensi.objects.update_or_create(
            sesi=sesi,
            siswa=siswa,
            defaults={'status': status}
        )
        
        return Response({
            'id': presensi.id,
            'siswa_id': siswa.id,
            'siswa_nama': siswa.name,
            'status': presensi.status,
            'waktu_scan': presensi.waktu_scan,
            'created': created,
            'message': 'Presensi berhasil direkam' if created else 'Presensi berhasil diupdate'
        })
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def aktif_sesi(self, request):
        """Get currently active session for current user"""
        # Get active session for guru
        sesi = SesiPresensi.objects.filter(
            status=SesiPresensi.Status.AKTIF,
            kelas__wali_guru=request.user
        ).first()
        
        if not sesi:
            return Response(None)
        
        # Add jumlah hadir
        jumlah_hadir = sesi.presensi_list.count()
        data = self.get_serializer(sesi).data
        data['jumlah_hadir'] = jumlah_hadir
        data['kelas_nama'] = sesi.kelas.nama
        data['mata_pelajaran_nama'] = sesi.mata_pelajaran.nama if sesi.mata_pelajaran else None
        data['waktu_mulai'] = sesi.window_mulai
        data['waktu_selesai'] = sesi.window_selesai
        
        return Response(data)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def riwayat(self, request):
        """Get session history"""
        filter_param = request.query_params.get('filter', 'week')
        
        qs = SesiPresensi.objects.filter(
            status=SesiPresensi.Status.SELESAI,
            kelas__wali_guru=request.user
        ).select_related('kelas')
        
        # Filter by date range
        today = date.today()
        if filter_param == 'week':
            start_date = today - dj_tz.timedelta(days=7)
            qs = qs.filter(tanggal__gte=start_date)
        elif filter_param == 'month':
            start_date = today - dj_tz.timedelta(days=30)
            qs = qs.filter(tanggal__gte=start_date)
        
        # Annotate with counts
        qs = qs.annotate(
            hadir_count=Count('presensi_list', filter=Q(presensi_list__status='HADIR'))
        )
        
        # Build response
        result = []
        for sesi in qs[:50]:  # Limit to 50 recent sessions
            total_siswa = SiswaKelas.objects.filter(kelas=sesi.kelas).count()
            hadir = sesi.hadir_count
            tidak_hadir = total_siswa - hadir
            persentase = (hadir / total_siswa * 100) if total_siswa > 0 else 0
            
            result.append({
                'id': sesi.id,
                'kelas_nama': sesi.kelas.nama,
                'mata_pelajaran_nama': sesi.mata_pelajaran.nama if sesi.mata_pelajaran else None,
                'tanggal': sesi.tanggal,
                'jam_mulai': sesi.window_mulai.strftime('%H:%M') if sesi.window_mulai else '-',
                'jam_selesai': sesi.window_selesai.strftime('%H:%M') if sesi.window_selesai else '-',
                'total_siswa': total_siswa,
                'hadir': hadir,
                'tidak_hadir': tidak_hadir,
                'persentase_kehadiran': round(persentase, 1)
            })
        
        return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def siswa_statistics(request):
    """Get statistics for siswa dashboard"""
    user = request.user
    today = date.today()
    
    # Get kelas siswa
    kelas_ids = SiswaKelas.objects.filter(siswa=user).values_list('kelas_id', flat=True)
    
    # Status hari ini
    today_presensi = Presensi.objects.filter(
        siswa=user,
        sesi__tanggal=today,
        sesi__kelas_id__in=kelas_ids
    ).first()
    
    today_status = 'Belum Absen'
    if today_presensi:
        today_status = today_presensi.status
    
    # Stats bulan ini
    start_of_month = today.replace(day=1)
    monthly_presensi = Presensi.objects.filter(
        siswa=user,
        sesi__tanggal__gte=start_of_month,
        sesi__kelas_id__in=kelas_ids
    )
    
    hadir_count = monthly_presensi.filter(status=Presensi.Status.HADIR).count()
    terlambat_count = monthly_presensi.filter(status=Presensi.Status.TERLAMBAT).count()
    total_sesi_bulan_ini = SesiPresensi.objects.filter(
        tanggal__gte=start_of_month,
        tanggal__lte=today,
        status=SesiPresensi.Status.SELESAI,
        kelas_id__in=kelas_ids
    ).count()
    
    attendance_rate = 0
    if total_sesi_bulan_ini > 0:
        attendance_rate = round((hadir_count / total_sesi_bulan_ini) * 100, 1)
    
    return Response({
        'todayStatus': today_status,
        'monthlyStats': {
            'present': hadir_count,
            'late': terlambat_count,
            'total': total_sesi_bulan_ini
        },
        'attendanceRate': attendance_rate
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def siswa_riwayat(request):
    """Get attendance history for siswa"""
    user = request.user
    
    # Get kelas siswa
    kelas_ids = SiswaKelas.objects.filter(siswa=user).values_list('kelas_id', flat=True)
    
    # Get presensi records
    presensi_list = Presensi.objects.filter(
        siswa=user,
        sesi__kelas_id__in=kelas_ids
    ).select_related('sesi__kelas', 'sesi__kelas__wali_guru').order_by('-sesi__tanggal', '-waktu_scan')[:100]
    
    result = []
    for presensi in presensi_list:
        sesi = presensi.sesi
        result.append({
            'id': presensi.id,
            'sesi_id': sesi.id,
            'kelas_nama': sesi.kelas.nama,
            'mata_pelajaran_nama': sesi.mata_pelajaran.nama if sesi.mata_pelajaran else None,
            'tanggal': sesi.tanggal,
            'jam_mulai': sesi.window_mulai.strftime('%H:%M') if sesi.window_mulai else '-',
            'jam_selesai': sesi.window_selesai.strftime('%H:%M') if sesi.window_selesai else '-',
            'waktu_scan': presensi.waktu_scan,
            'status': presensi.status,
            'guru_nama': sesi.kelas.wali_guru.name if sesi.kelas.wali_guru else '-'
        })
    
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def siswa_riwayat_detail(request, presensi_id):
    """Get detail of specific attendance record"""
    try:
        presensi = Presensi.objects.select_related(
            'sesi__kelas__wali_guru'
        ).get(id=presensi_id, siswa=request.user)
    except Presensi.DoesNotExist:
        return Response({'detail': 'Presensi not found'}, status=404)
    
    sesi = presensi.sesi
    
    return Response({
        'id': presensi.id,
        'kelas_nama': sesi.kelas.nama,
        'mata_pelajaran_nama': sesi.mata_pelajaran.nama if sesi.mata_pelajaran else None,
        'guru_nama': sesi.kelas.wali_guru.name if sesi.kelas.wali_guru else '-',
        'tanggal': sesi.tanggal,
        'jam_mulai': sesi.window_mulai.strftime('%H:%M') if sesi.window_mulai else '-',
        'jam_selesai': sesi.window_selesai.strftime('%H:%M') if sesi.window_selesai else '-',
        'waktu_scan': presensi.waktu_scan,
        'status': presensi.status
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def scan_view(request):
    token = request.data.get("token")
    if not token:
        return Response({"detail": "token required"}, status=400)
    try:
        sesi = SesiPresensi.objects.get(qr_token=token)
    except SesiPresensi.DoesNotExist:
        return Response({"detail": "invalid token"}, status=404)

    now = dj_tz.now()
    if sesi.status != SesiPresensi.Status.AKTIF:
        return Response({"detail": "sesi tidak aktif"}, status=400)
    if not (sesi.window_mulai and sesi.window_selesai and sesi.window_mulai <= now <= sesi.window_selesai):
        return Response({"detail": "di luar window waktu"}, status=400)

    # validasi siswa anggota kelas
    if not SiswaKelas.objects.filter(kelas_id=sesi.kelas_id, siswa_id=request.user.id).exists():
        return Response({"detail": "siswa bukan anggota kelas ini"}, status=403)

    # upsert presensi
    presensi, created = Presensi.objects.get_or_create(
        sesi=sesi,
        siswa=request.user,
        defaults={"status": Presensi.Status.HADIR},
    )
    
    # Build response with additional info
    data = PresensiSerializer(presensi).data
    data['already_scanned'] = not created  # ✅ Flag untuk duplicate scan
    data['kelas_nama'] = sesi.kelas.nama
    data['mata_pelajaran_nama'] = sesi.mata_pelajaran.nama if sesi.mata_pelajaran else None
    data['guru_nama'] = sesi.kelas.wali_guru.name if sesi.kelas.wali_guru else '-'
    data['tanggal'] = sesi.tanggal
    data['jam_mulai'] = sesi.window_mulai.strftime('%H:%M') if sesi.window_mulai else '-'
    data['jam_selesai'] = sesi.window_selesai.strftime('%H:%M') if sesi.window_selesai else '-'
    
    return Response(data, status=200)
