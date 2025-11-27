from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SesiViewSet, scan_view, siswa_statistics, siswa_riwayat, siswa_riwayat_detail

router = DefaultRouter()
router.register(r"sesi", SesiViewSet, basename="sesi")

urlpatterns = [
    path("", include(router.urls)),
    path("scan", scan_view, name="scan"),
    path("siswa/statistics/", siswa_statistics, name="siswa-statistics"),
    path("siswa/riwayat/", siswa_riwayat, name="siswa-riwayat"),
    path("siswa/riwayat/<int:presensi_id>/", siswa_riwayat_detail, name="siswa-riwayat-detail"),
]
