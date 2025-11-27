from django.core.management.base import BaseCommand
from apps.users.models import User


class Command(BaseCommand):
    help = "Generate dummy users (admin, guru, siswa)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--admin",
            type=int,
            default=2,
            help="Number of admin users to create (default: 2)",
        )
        parser.add_argument(
            "--guru",
            type=int,
            default=10,
            help="Number of guru users to create (default: 10)",
        )
        parser.add_argument(
            "--siswa",
            type=int,
            default=50,
            help="Number of siswa users to create (default: 50)",
        )
        parser.add_argument(
            "--password",
            type=str,
            default="password123",
            help="Default password for all users (default: password123)",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing non-superuser users before seeding",
        )

    def handle(self, *args, **options):
        num_admin = options["admin"]
        num_guru = options["guru"]
        num_siswa = options["siswa"]
        password = options["password"]
        clear = options["clear"]

        if clear:
            deleted_count = User.objects.filter(is_superuser=False).count()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(
                self.style.WARNING(f"Deleted {deleted_count} existing non-superuser users")
            )

        created_users = []

        # Create admin users
        for i in range(1, num_admin + 1):
            username = f"admin{i}"
            email = f"admin{i}@slador.com"
            
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.WARNING(f"User {username} already exists, skipping...")
                )
                continue

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                name=f"Admin {i}",
                role=User.Role.ADMIN,
                is_staff=True,
            )
            created_users.append(user)
            self.stdout.write(
                self.style.SUCCESS(f"Created admin: {username} ({email})")
            )

        # Create guru users
        for i in range(1, num_guru + 1):
            username = f"guru{i}"
            email = f"guru{i}@slador.com"
            
            if User.objects.filter(username=username).exists():
                self.stdout.write(
                    self.style.WARNING(f"User {username} already exists, skipping...")
                )
                continue

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                name=f"Guru {i}",
                role=User.Role.GURU,
            )
            created_users.append(user)

        self.stdout.write(
            self.style.SUCCESS(f"Created {num_guru} guru users")
        )

        # Create siswa users
        for i in range(1, num_siswa + 1):
            username = f"siswa{i}"
            email = f"siswa{i}@slador.com"
            
            if User.objects.filter(username=username).exists():
                continue

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                name=f"Siswa {i}",
                role=User.Role.SISWA,
            )
            created_users.append(user)

        self.stdout.write(
            self.style.SUCCESS(f"Created {num_siswa} siswa users")
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"\n[OK] Total {len(created_users)} users created successfully!"
            )
        )
        self.stdout.write(f"Default password: {password}")

