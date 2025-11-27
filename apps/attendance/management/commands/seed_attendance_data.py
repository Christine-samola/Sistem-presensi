"""
Django management command untuk seed data presensi dummy
Usage: python manage.py seed_attendance_data --days=30
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from datetime import date, timedelta
import random
import secrets

from apps.attendance.models import SesiPresensi, Presensi
from apps.classes.models import Kelas, SiswaKelas, MataPelajaran
from apps.users.models import User


class Command(BaseCommand):
    help = 'Seed attendance data untuk testing laporan'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days to generate attendance (default: 30)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing attendance data before seeding',
        )

    def handle(self, *args, **options):
        days = options['days']
        
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing attendance data...'))
            Presensi.objects.all().delete()
            SesiPresensi.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✓ Attendance data cleared'))

        # Check if there's data to seed
        kelas_count = Kelas.objects.count()
        if kelas_count == 0:
            self.stdout.write(self.style.ERROR('❌ No classes found. Run seed_fresh_data first.'))
            return

        with transaction.atomic():
            self.stdout.write(f'Creating attendance data for last {days} days...')
            
            total_sesi = 0
            total_presensi = 0
            
            # Get all kelas
            all_kelas = list(Kelas.objects.all())
            all_mapel = list(MataPelajaran.objects.all())
            
            # Generate for each day
            for day_offset in range(days, 0, -1):
                target_date = date.today() - timedelta(days=day_offset)
                
                # Skip weekends
                if target_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
                    continue
                
                # Create 2-4 sesi per day (random)
                sesi_per_day = random.randint(2, 4)
                
                for _ in range(sesi_per_day):
                    kelas = random.choice(all_kelas)
                    mapel = random.choice(all_mapel) if all_mapel else None
                    
                    # Generate sesi time
                    hour = random.randint(7, 14)
                    start_time = timezone.make_aware(
                        timezone.datetime.combine(target_date, timezone.datetime.min.time())
                        .replace(hour=hour, minute=0)
                    )
                    end_time = start_time + timedelta(hours=1)
                    
                    # Create sesi
                    sesi = SesiPresensi.objects.create(
                        kelas=kelas,
                        mata_pelajaran=mapel,
                        tanggal=target_date,
                        window_mulai=start_time,
                        window_selesai=end_time,
                        qr_token=secrets.token_urlsafe(24),
                        status=SesiPresensi.Status.SELESAI
                    )
                    total_sesi += 1
                    
                    # Get siswa in this kelas
                    siswa_kelas = SiswaKelas.objects.filter(kelas=kelas).select_related('siswa')
                    
                    for sk in siswa_kelas:
                        # 85% chance hadir, 5% terlambat, 3% izin, 3% sakit, 4% alpha
                        rand = random.random()
                        if rand < 0.85:
                            status = Presensi.Status.HADIR
                        elif rand < 0.90:
                            status = Presensi.Status.TERLAMBAT
                        elif rand < 0.93:
                            status = Presensi.Status.IZIN
                        elif rand < 0.96:
                            status = Presensi.Status.SAKIT
                        else:
                            status = Presensi.Status.ALPHA
                        
                        # Create presensi
                        Presensi.objects.create(
                            sesi=sesi,
                            siswa=sk.siswa,
                            status=status
                        )
                        total_presensi += 1
            
            self.stdout.write(self.style.SUCCESS(f'\n✓ Created {total_sesi} sesi presensi'))
            self.stdout.write(self.style.SUCCESS(f'✓ Created {total_presensi} presensi records'))
            
        self.stdout.write(self.style.SUCCESS('\n🎉 Attendance data seeding completed!'))
        self.stdout.write('\nYou can now view reports at /admin/laporan')

