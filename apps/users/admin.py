from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User, Settings


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Role", {"fields": ("role", "name",)}),
    )
    list_display = ("id", "username", "email", "role", "is_active")
    search_fields = ("username", "email", "name")
    ordering = ("id",)


@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("School Information", {
            "fields": ("school_name", "school_address", "school_phone", "school_email")
        }),
        ("Attendance Settings", {
            "fields": ("attendance_start_time", "attendance_end_time", "late_threshold", "auto_absent_time")
        }),
        ("Notification Settings", {
            "fields": ("enable_notifications", "enable_email_alerts", "enable_sms_alerts")
        }),
        ("Metadata", {
            "fields": ("updated_at", "updated_by"),
            "classes": ("collapse",)
        }),
    )
    readonly_fields = ("updated_at",)
    list_display = ("school_name", "school_email", "updated_at", "updated_by")
    
    def has_add_permission(self, request):
        # Only allow one settings instance
        return not Settings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of settings
        return False
