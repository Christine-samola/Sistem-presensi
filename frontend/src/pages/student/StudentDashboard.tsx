import StudentLayout from '../../layouts/StudentLayout'
import { QrCode, Users, BarChart3, LogOut, Calendar, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface Stats {
  todayStatus: string
  monthlyStats: {
    present: number
    late: number
    total: number
  }
  attendanceRate: number
}

interface RecentActivity {
  id: number
  kelas_nama: string
  status: string
  waktu_scan: string
}

export default function StudentDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  // Fetch dashboard stats from API
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['student-stats'],
    queryFn: async () => {
      const response = await api.get('/api/siswa/statistics/')
      return response.data as Stats
    },
    retry: 1,
  })

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['student-recent'],
    queryFn: async () => {
      const response = await api.get('/api/siswa/riwayat/')
      return response.data as RecentActivity[]
    },
    retry: 1,
  })

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar?')) {
      logout()
      navigate('/')
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'HADIR') return 'text-green-600'
    if (status === 'TERLAMBAT') return 'text-orange-600'
    if (status === 'SAKIT') return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <StudentLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3 h-3 text-gray-500" />
            <span className="text-gray-600">{new Date().toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Quick Stats Row */}
        {loadingStats ? (
          <div className="text-center py-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Today's Status */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Status Hari Ini</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  stats?.todayStatus === 'HADIR' ? 'bg-green-500' : 
                  stats?.todayStatus === 'TERLAMBAT' ? 'bg-orange-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-lg font-bold text-gray-900">{stats?.todayStatus || 'Belum Absen'}</span>
              </div>
            </div>

            {/* Monthly Present */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Bulan Ini</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">{stats?.monthlyStats.present || 0}</span>
                <span className="text-xs text-gray-500">/ {stats?.monthlyStats.total || 0}</span>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Tingkat Kehadiran</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-green-600">{stats?.attendanceRate || 0}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Action Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Student Class Card */}
          <Link
            to="/siswa/riwayat"
            className="group bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all hover:border-blue-300"
          >
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Riwayat Kelas</h3>
                <p className="text-xs text-gray-600 mt-0.5">Lihat riwayat</p>
              </div>
            </div>
          </Link>

          {/* Class Statistic Card */}
          <Link
            to="/siswa/riwayat"
            className="group bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all hover:border-purple-300"
          >
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Statistik</h3>
                <p className="text-xs text-gray-600 mt-0.5">Lihat statistik</p>
              </div>
            </div>
          </Link>

          {/* Take Attendance Card */}
          <Link
            to="/siswa/scan"
            className="group bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all hover:border-green-300"
          >
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Absen Sekarang</h3>
                <p className="text-xs text-gray-600 mt-0.5">Scan QR code</p>
              </div>
            </div>
          </Link>

          {/* Log out Card */}
          <button
            onClick={handleLogout}
            className="group bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all hover:border-red-300 text-left"
          >
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                <LogOut className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Keluar</h3>
                <p className="text-xs text-gray-600 mt-0.5">Sign out</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Aktivitas Terakhir</h2>
            <Link to="/siswa/riwayat" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Lihat semua
            </Link>
          </div>
          <div className="space-y-2">
            {!recentActivity || recentActivity.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs">
                Belum ada aktivitas
              </div>
            ) : (
              recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{activity.kelas_nama}</p>
                    <p className="text-xs text-gray-600">
                      {activity.status} • {new Date(activity.waktu_scan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
