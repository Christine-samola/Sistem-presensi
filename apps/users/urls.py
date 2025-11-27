from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, RefreshView, MeView, ChangePasswordView, UserViewSet
from .admin_views import admin_statistics, admin_attendance_report, admin_settings

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path("login", LoginView.as_view(), name="login"),
    path("refresh", RefreshView.as_view(), name="refresh"),
    path("me", MeView.as_view(), name="me"),
    path("me/password", ChangePasswordView.as_view(), name="change_password"),
    path("list/", include(router.urls)),
]
