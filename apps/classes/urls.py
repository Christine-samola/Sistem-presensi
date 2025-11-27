from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KelasViewSet, JadwalViewSet, MataPelajaranViewSet, guru_statistics

router = DefaultRouter()
router.register(r"kelas", KelasViewSet, basename="kelas")
router.register(r"jadwal", JadwalViewSet, basename="jadwal")
router.register(r"mata-pelajaran", MataPelajaranViewSet, basename="mata-pelajaran")

urlpatterns = [
    path("", include(router.urls)),
    path("guru/statistics/", guru_statistics, name="guru-statistics"),
]
