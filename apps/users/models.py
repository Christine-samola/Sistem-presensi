from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        GURU = "GURU", "Guru"
        SISWA = "SISWA", "Siswa"

    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200, blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.SISWA)
    nim = models.CharField(max_length=50, blank=True, null=True)  # Nomor Induk Mahasiswa/Siswa
    nip = models.CharField(max_length=50, blank=True, null=True)  # Nomor Induk Pegawai (Guru)

    REQUIRED_FIELDS = ["email"]

    def save(self, *args, **kwargs):
        """Override save to automatically set role to ADMIN for superusers."""
        if self.is_superuser:
            self.role = self.Role.ADMIN
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"


class Settings(models.Model):
    """Model untuk menyimpan pengaturan sistem"""
    
    # School Information
    school_name = models.CharField(max_length=200, default='SMA SLADOR')
    school_address = models.TextField(default='Jl. Pendidikan No. 123, Jakarta')
    school_phone = models.CharField(max_length=20, default='021-12345678')
    school_email = models.EmailField(default='admin@smaslador.sch.id')
    
    # Attendance Settings
    attendance_start_time = models.TimeField(default='07:00')
    attendance_end_time = models.TimeField(default='15:00')
    late_threshold = models.TimeField(default='07:15')
    auto_absent_time = models.TimeField(default='08:00')
    
    # Notification Settings
    enable_notifications = models.BooleanField(default=True)
    enable_email_alerts = models.BooleanField(default=False)
    enable_sms_alerts = models.BooleanField(default=False)
    
    # Metadata
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = 'Settings'
        verbose_name_plural = 'Settings'
    
    def __str__(self):
        return f"Settings - {self.school_name}"
    
    @classmethod
    def get_settings(cls):
        """Get or create settings singleton"""
        settings, created = cls.objects.get_or_create(id=1)
        return settings
    
    def to_dict(self):
        """Convert settings to dictionary"""
        from datetime import time
        
        # Helper function to convert time field to string
        def time_to_str(time_field):
            if isinstance(time_field, time):
                return time_field.strftime('%H:%M')
            elif isinstance(time_field, str):
                return time_field
            return '00:00'
        
        return {
            'schoolName': self.school_name,
            'schoolAddress': self.school_address,
            'schoolPhone': self.school_phone,
            'schoolEmail': self.school_email,
            'attendanceStartTime': time_to_str(self.attendance_start_time),
            'attendanceEndTime': time_to_str(self.attendance_end_time),
            'lateThreshold': time_to_str(self.late_threshold),
            'autoAbsentTime': time_to_str(self.auto_absent_time),
            'enableNotifications': self.enable_notifications,
            'enableEmailAlerts': self.enable_email_alerts,
            'enableSMSAlerts': self.enable_sms_alerts,
        }
    
    def update_from_dict(self, data, user=None):
        """Update settings from dictionary"""
        from datetime import time
        
        # Define time fields that need special handling
        time_fields = {
            'attendanceStartTime': 'attendance_start_time',
            'attendanceEndTime': 'attendance_end_time',
            'lateThreshold': 'late_threshold',
            'autoAbsentTime': 'auto_absent_time',
        }
        
        # Define other fields
        field_mapping = {
            'schoolName': 'school_name',
            'schoolAddress': 'school_address',
            'schoolPhone': 'school_phone',
            'schoolEmail': 'school_email',
            'enableNotifications': 'enable_notifications',
            'enableEmailAlerts': 'enable_email_alerts',
            'enableSMSAlerts': 'enable_sms_alerts',
        }
        
        # Update regular fields
        for frontend_key, backend_key in field_mapping.items():
            if frontend_key in data:
                setattr(self, backend_key, data[frontend_key])
        
        # Update time fields with proper conversion
        for frontend_key, backend_key in time_fields.items():
            if frontend_key in data:
                time_value = data[frontend_key]
                # Convert string to time object if needed
                if isinstance(time_value, str):
                    try:
                        hour, minute = map(int, time_value.split(':'))
                        time_value = time(hour=hour, minute=minute)
                    except (ValueError, AttributeError):
                        continue  # Skip invalid time values
                setattr(self, backend_key, time_value)
        
        if user:
            self.updated_by = user
        
        self.save()
        return self
