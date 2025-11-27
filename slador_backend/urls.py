from django.contrib import admin
from django.urls import path, include
from apps.users.admin_views import admin_statistics, admin_attendance_report, admin_settings

from apps.users import urls as users_urls

urlpatterns = [
    # Auth endpoints (login, refresh, me)
    path("api/auth/login", users_urls.LoginView.as_view(), name="login"),
    path("api/auth/refresh", users_urls.RefreshView.as_view(), name="refresh"),
    path("api/auth/me", users_urls.MeView.as_view(), name="me"),
    path("api/auth/me/password", users_urls.ChangePasswordView.as_view(), name="change_password"),
    # User management endpoints
    path("api/users/", include("apps.users.urls")),
    # Other app endpoints
    path("api/", include("apps.classes.urls")),
    path("api/", include("apps.attendance.urls")),
    # Admin API endpoints (must be before Django admin)
    path("api/admin/statistics", admin_statistics, name="admin-statistics"),
    path("api/admin/attendance/report", admin_attendance_report, name="admin-attendance-report"),
    path("api/admin/settings", admin_settings, name="admin-settings"),
    # Django admin site
    path("admin/", admin.site.urls),
]
