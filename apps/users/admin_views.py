from datetime import date
from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import User, Settings
from .permissions import IsAdmin
from apps.attendance.models import SesiPresensi, Presensi
from apps.classes.models import Kelas


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_statistics(request):
    """Get statistics for admin dashboard"""
    print(f"[AdminStats] User: {request.user} (Role: {request.user.role})")
    
    today = date.today()
    
    # Count users by role
    total_students = User.objects.filter(role=User.Role.SISWA, is_active=True).count()
    total_teachers = User.objects.filter(role=User.Role.GURU, is_active=True).count()
    
    # Count today's attendance
    today_attendance = Presensi.objects.filter(
        sesi__tanggal=today,
        status__in=[Presensi.Status.HADIR, Presensi.Status.TERLAMBAT]
    ).count()
    
    # Count total classes
    total_subjects = Kelas.objects.count()
    
    stats = {
        'totalStudents': total_students,
        'totalTeachers': total_teachers,
        'todayAttendance': today_attendance,
        'totalSubjects': total_subjects
    }
    
    print(f"[AdminStats] Response: {stats}")
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_attendance_report(request):
    """Get attendance report for admin"""
    from django.db.models import Count, Q
    from apps.classes.models import SiswaKelas, Kelas
    
    # Get filter parameters
    start_date = request.query_params.get('startDate')
    end_date = request.query_params.get('endDate')
    class_filter = request.query_params.get('class')
    
    print(f"[AttendanceReport] Filters - startDate: {start_date}, endDate: {end_date}, class: {class_filter}")
    
    # Build queryset
    qs = Presensi.objects.all()
    
    # Apply date filters
    if start_date:
        qs = qs.filter(sesi__tanggal__gte=start_date)
    if end_date:
        qs = qs.filter(sesi__tanggal__lte=end_date)
    
    # Apply class filter
    if class_filter and class_filter != 'ALL':
        # Log all kelas names to debug
        all_kelas = Kelas.objects.values_list('nama', flat=True)
        print(f"[AttendanceReport] Available kelas: {list(all_kelas)}")
        print(f"[AttendanceReport] Filtering by: {class_filter}")
        
        qs = qs.filter(sesi__kelas__nama__icontains=class_filter)
        print(f"[AttendanceReport] Query count after filter: {qs.count()}")
    
    # Count by status
    total_present = qs.filter(status__in=[Presensi.Status.HADIR, Presensi.Status.TERLAMBAT]).count()
    total_permit = qs.filter(status=Presensi.Status.IZIN).count()
    total_sick = qs.filter(status=Presensi.Status.SAKIT).count()
    total_absent = qs.filter(status=Presensi.Status.ALPHA).count()
    
    # Get class attendance rate
    class_rates = []
    for kelas in Kelas.objects.all().order_by('tingkat', 'nama'):
        # Filter presensi by date if needed
        kelas_presensi = Presensi.objects.filter(sesi__kelas=kelas)
        if start_date:
            kelas_presensi = kelas_presensi.filter(sesi__tanggal__gte=start_date)
        if end_date:
            kelas_presensi = kelas_presensi.filter(sesi__tanggal__lte=end_date)
        
        total_records = kelas_presensi.count()
        if total_records > 0:
            hadir_count = kelas_presensi.filter(
                status__in=[Presensi.Status.HADIR, Presensi.Status.TERLAMBAT]
            ).count()
            rate = round((hadir_count / total_records) * 100, 1)
            
            class_rates.append({
                'class': kelas.nama,
                'rate': rate,
                'color': 'bg-green-500' if rate >= 90 else 'bg-yellow-500' if rate >= 75 else 'bg-red-500'
            })
    
    # Get student details
    student_details = []
    
    # Get all siswa with their attendance
    siswa_list = User.objects.filter(role=User.Role.SISWA, is_active=True).order_by('name')[:50]  # Limit 50
    
    for siswa in siswa_list:
        # Get siswa's kelas
        siswa_kelas = SiswaKelas.objects.filter(siswa=siswa).first()
        if not siswa_kelas:
            continue
            
        # Get presensi for this siswa
        siswa_presensi = Presensi.objects.filter(siswa=siswa)
        if start_date:
            siswa_presensi = siswa_presensi.filter(sesi__tanggal__gte=start_date)
        if end_date:
            siswa_presensi = siswa_presensi.filter(sesi__tanggal__lte=end_date)
        if class_filter and class_filter != 'ALL':
            siswa_presensi = siswa_presensi.filter(sesi__kelas__nama__icontains=class_filter)
        
        total = siswa_presensi.count()
        if total > 0:
            hadir = siswa_presensi.filter(status__in=[Presensi.Status.HADIR, Presensi.Status.TERLAMBAT]).count()
            izin = siswa_presensi.filter(status=Presensi.Status.IZIN).count()
            sakit = siswa_presensi.filter(status=Presensi.Status.SAKIT).count()
            alpha = siswa_presensi.filter(status=Presensi.Status.ALPHA).count()
            percentage = round((hadir / total) * 100, 1)
            
            student_details.append({
                'name': siswa.name,
                'class': siswa_kelas.kelas.nama,
                'hadir': hadir,
                'izin': izin,
                'sakit': sakit,
                'alpha': alpha,
                'percentage': percentage
            })
    
    return Response({
        'totalPresent': total_present,
        'totalPermit': total_permit,
        'totalSick': total_sick,
        'totalAbsent': total_absent,
        'classRates': class_rates,
        'studentDetails': student_details
    })


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_settings(request):
    """Get or update admin settings"""
    settings = Settings.get_settings()
    
    if request.method == 'GET':
        # Return settings from database
        return Response(settings.to_dict())
    
    elif request.method == 'PATCH':
        # Update settings in database
        settings.update_from_dict(request.data, user=request.user)
        return Response({
            'detail': 'Settings updated successfully',
            'settings': settings.to_dict()
        })

