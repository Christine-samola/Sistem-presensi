from django.core.management.base import BaseCommand
from django.db import transaction
from apps.classes.models import Kelas, SiswaKelas, Jadwal
from apps.users.models import User
import random
from datetime import time


class Command(BaseCommand):
    help = "Generate dummy classes (kelas) and assign students"

    def add_arguments(self, parser):
        parser.add_argument(
            "--kelas",
            type=int,
            default=5,
            help="Number of classes to create (default: 5)",
        )
        parser.add_argument(
            "--tahun",
            type=str,
            default="2024/2025",
            help="Academic year (default: 2024/2025)",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing classes before seeding",
        )
        parser.add_argument(
            "--with-jadwal",
            action="store_true",
            help="Also generate sample schedules for each class",
        )

    def handle(self, *args, **options):
        num_kelas = options["kelas"]
        tahun_ajaran = options["tahun"]
        clear = options["clear"]
        with_jadwal = options["with_jadwal"]

        # Check if there are enough users
        guru_list = list(User.objects.filter(role=User.Role.GURU))
        siswa_list = list(User.objects.filter(role=User.Role.SISWA))

        if not guru_list:
            self.stdout.write(
                self.style.ERROR(
                    "No guru users found! Please run 'python manage.py seed_users' first."
                )
            )
            return

        if not siswa_list:
            self.stdout.write(
                self.style.WARNING(
                    "No siswa users found! Classes will be created without students."
                )
            )

        if clear:
            deleted_count = Kelas.objects.count()
            Kelas.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(f"Deleted {deleted_count} existing classes")
            )

        # Class names for grades 10, 11, 12
        tingkat = ["X", "XI", "XII"]
        jurusan = ["IPA", "IPS"]
        
        created_classes = []
        created_schedules = []

        with transaction.atomic():
            for i in range(1, num_kelas + 1):
                # Generate class name
                tingkat_choice = random.choice(tingkat)
                jurusan_choice = random.choice(jurusan)
                nomor = random.randint(1, 5)
                
                kode = f"{tingkat_choice}-{jurusan_choice}-{nomor}"
                nama = f"Kelas {tingkat_choice} {jurusan_choice} {nomor}"

                # Skip if exists
                if Kelas.objects.filter(kode=kode).exists():
                    self.stdout.write(
                        self.style.WARNING(f"Class {kode} already exists, generating new name...")
                    )
                    kode = f"{tingkat_choice}-{jurusan_choice}-{random.randint(6, 20)}"
                    nama = f"Kelas {tingkat_choice} {jurusan_choice} {random.randint(6, 20)}"

                # Assign random wali guru
                wali_guru = random.choice(guru_list) if guru_list else None

                kelas = Kelas.objects.create(
                    kode=kode,
                    nama=nama,
                    tahun_ajaran=tahun_ajaran,
                    wali_guru=wali_guru,
                )
                created_classes.append(kelas)

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created class: {kode} - {nama} (Wali: {wali_guru.name if wali_guru else 'None'})"
                    )
                )

                # Assign random students to this class (10-30 students per class)
                if siswa_list:
                    num_students = min(random.randint(10, 30), len(siswa_list))
                    selected_students = random.sample(siswa_list, num_students)

                    for siswa in selected_students:
                        SiswaKelas.objects.get_or_create(
                            siswa=siswa,
                            kelas=kelas,
                        )
                    
                    self.stdout.write(
                        f"  -> Assigned {num_students} students to {kode}"
                    )

                # Create sample schedules if requested
                if with_jadwal:
                    schedules = self._create_sample_schedules(kelas)
                    created_schedules.extend(schedules)
                    self.stdout.write(
                        f"  -> Created {len(schedules)} schedules for {kode}"
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f"\n[OK] Total {len(created_classes)} classes created successfully!"
            )
        )
        
        if created_schedules:
            self.stdout.write(
                self.style.SUCCESS(
                    f"[OK] Total {len(created_schedules)} schedules created!"
                )
            )

    def _create_sample_schedules(self, kelas):
        """Create sample schedules for a class"""
        subjects = [
            "Matematika",
            "Bahasa Indonesia",
            "Bahasa Inggris",
            "Fisika",
            "Kimia",
            "Biologi",
            "Sejarah",
            "Geografi",
            "Ekonomi",
            "Sosiologi",
        ]
        
        days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]
        rooms = ["A101", "A102", "B201", "B202", "Lab IPA", "Lab Komputer"]
        
        schedules = []
        selected_subjects = random.sample(subjects, min(5, len(subjects)))
        
        for idx, subject in enumerate(selected_subjects):
            day = days[idx % len(days)]
            start_hour = 8 + (idx * 2)
            end_hour = start_hour + 2
            
            schedule = Jadwal.objects.create(
                kelas=kelas,
                mapel=subject,
                hari=day,
                jam_mulai=time(start_hour, 0),
                jam_selesai=time(end_hour, 0),
                ruang=random.choice(rooms),
            )
            schedules.append(schedule)
        
        return schedules

