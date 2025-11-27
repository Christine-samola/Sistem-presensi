from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = "Run all seeding commands (users and classes)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing data before seeding",
        )
        parser.add_argument(
            "--with-jadwal",
            action="store_true",
            help="Also generate sample schedules for each class",
        )

    def handle(self, *args, **options):
        clear = options["clear"]
        with_jadwal = options["with_jadwal"]

        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(self.style.SUCCESS("Starting data seeding process..."))
        self.stdout.write(self.style.SUCCESS("=" * 60))

        # Seed users first
        self.stdout.write("\n" + self.style.WARNING("Step 1: Seeding users..."))
        call_command("seed_users", clear=clear)

        # Seed classes
        self.stdout.write("\n" + self.style.WARNING("Step 2: Seeding classes..."))
        call_command("seed_classes", clear=clear, with_jadwal=with_jadwal)

        self.stdout.write("\n" + self.style.SUCCESS("=" * 60))
        self.stdout.write(
            self.style.SUCCESS("[OK] All seeding completed successfully!")
        )
        self.stdout.write(self.style.SUCCESS("=" * 60))
        
        self.stdout.write("\n" + self.style.SUCCESS("You can now login with:"))
        self.stdout.write("  - Username: admin1, Password: password123")
        self.stdout.write("  - Username: guru1, Password: password123")
        self.stdout.write("  - Username: siswa1, Password: password123")

