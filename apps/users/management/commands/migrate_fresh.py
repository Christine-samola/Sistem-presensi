"""
Django management command seperti Laravel's "migrate:fresh --seed"
Usage: python manage.py migrate_fresh [--seed]
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
import sys


class Command(BaseCommand):
    help = 'Drop all tables, run migrations from scratch, and optionally seed data (Laravel style)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--seed',
            action='store_true',
            help='Run seeders after migration',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force execution without confirmation',
        )

    def handle(self, *args, **options):
        # Confirmation
        if not options['force']:
            self.stdout.write(self.style.WARNING(
                '\n⚠️  WARNING: This will DROP ALL TABLES and DATA!\n'
            ))
            confirm = input('Are you sure you want to continue? (yes/no): ')
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.ERROR('Operation cancelled.'))
                return

        try:
            # Step 1: Drop all tables
            self.stdout.write(self.style.WARNING('\n🗑️  Dropping all tables...'))
            self._drop_all_tables()
            self.stdout.write(self.style.SUCCESS('✓ All tables dropped'))

            # Step 2: Run migrations
            self.stdout.write(self.style.WARNING('\n📦 Running migrations...'))
            call_command('migrate', interactive=False, verbosity=1)
            self.stdout.write(self.style.SUCCESS('✓ Migrations completed'))

            # Step 3: Create superuser (optional)
            self.stdout.write(self.style.WARNING('\n👤 Creating default admin...'))
            self._create_default_admin()
            self.stdout.write(self.style.SUCCESS('✓ Default admin created'))

            # Step 4: Run seeders
            if options['seed']:
                self.stdout.write(self.style.WARNING('\n🌱 Seeding database...'))
                call_command('seed_fresh_data', verbosity=1)
                self.stdout.write(self.style.SUCCESS('✓ Database seeded'))

            self.stdout.write(self.style.SUCCESS(
                '\n🎉 migrate:fresh completed successfully!\n'
            ))
            
            if options['seed']:
                self.stdout.write(self.style.SUCCESS('Login Credentials:'))
                self.stdout.write('  Admin: admin@slador.com / admin123')
                self.stdout.write('  Guru: Yoab_Presensi@gmail.com / ADMING')
                self.stdout.write('  Siswa: albertho_Presensi@gmail.com / SISWA')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {str(e)}'))
            sys.exit(1)

    def _drop_all_tables(self):
        """Drop all tables in the database"""
        with connection.cursor() as cursor:
            # Get database name
            db_name = connection.settings_dict['NAME']
            
            # Disable foreign key checks (for MySQL)
            # For PostgreSQL, we need different approach
            if connection.vendor == 'postgresql':
                # Get all table names
                cursor.execute("""
                    SELECT tablename FROM pg_tables 
                    WHERE schemaname = 'public'
                """)
                tables = cursor.fetchall()
                
                # Drop each table
                for table in tables:
                    cursor.execute(f'DROP TABLE IF EXISTS "{table[0]}" CASCADE')
                    
            elif connection.vendor == 'mysql':
                cursor.execute('SET FOREIGN_KEY_CHECKS = 0')
                cursor.execute(f'SHOW TABLES FROM {db_name}')
                tables = cursor.fetchall()
                for table in tables:
                    cursor.execute(f'DROP TABLE IF EXISTS {table[0]}')
                cursor.execute('SET FOREIGN_KEY_CHECKS = 1')
                
            elif connection.vendor == 'sqlite':
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = cursor.fetchall()
                for table in tables:
                    if table[0] != 'sqlite_sequence':
                        cursor.execute(f'DROP TABLE IF EXISTS {table[0]}')

    def _create_default_admin(self):
        """Create default admin user"""
        from apps.users.models import User
        
        # Check if admin already exists
        if User.objects.filter(email='admin@slador.com').exists():
            return
        
        admin = User.objects.create(
            username='admin',
            email='admin@slador.com',
            name='Administrator',
            role=User.Role.ADMIN,
            is_active=True,
            is_staff=True,
            is_superuser=True
        )
        admin.set_password('admin123')
        admin.save()

