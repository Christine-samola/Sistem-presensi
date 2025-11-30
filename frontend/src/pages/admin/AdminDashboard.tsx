import { Users, GraduationCap, ClipboardCheck, BookOpen, Settings } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  
  // Fetch statistics data
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      console.log('Fetching admin statistics...')
      const response = await api.get('/api/admin/statistics')
      console.log('Admin statistics response:', response.data)
      return response.data
    },
    retry: 1,
  })

  // Debug log
  console.log('Stats:', stats)
  console.log('Loading:', isLoading)
  console.log('Error:', error)

  const statsCards = [
    {
      title: 'Total Siswa',
      value: stats?.totalStudents || '0',
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Guru',
      value: stats?.totalTeachers || '0',
      icon: GraduationCap,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Kehadiran Hari Ini',
      value: stats?.todayAttendance || '0',
      icon: ClipboardCheck,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Mata Pelajaran',
      value: stats?.totalSubjects || '0',
      icon: BookOpen,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Selamat datang di panel administrator SMA Slador</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Gagal memuat data statistik</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.detail || (error as any)?.message || 'Terjadi kesalahan'}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data statistik...</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {!isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => {
              const Icon = card.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    </div>
                    <div className={`${card.lightColor} ${card.textColor} p-4 rounded-xl`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pengguna Terbaru</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Ahmad Rizki</p>
                    <p className="text-sm text-gray-500">Siswa • Kelas 10A</p>
                  </div>
                  <span className="text-xs text-gray-400">2 jam lalu</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    S
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Siti Nurhaliza</p>
                    <p className="text-sm text-gray-500">Guru • Matematika</p>
                  </div>
                  <span className="text-xs text-gray-400">5 jam lalu</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    B
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Budi Santoso</p>
                    <p className="text-sm text-gray-500">Siswa • Kelas 11B</p>
                  </div>
                  <span className="text-xs text-gray-400">1 hari lalu</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/admin/manajemen-pengguna')}
                  className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                >
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Tambah Pengguna Baru</p>
                    <p className="text-sm text-gray-500">Daftarkan siswa atau guru baru</p>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/admin/laporan')}
                  className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
                >
                  <ClipboardCheck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Lihat Laporan</p>
                    <p className="text-sm text-gray-500">Akses laporan kehadiran lengkap</p>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/admin/pengaturan')}
                  className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
                >
                  <Settings className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Kelola Sistem</p>
                    <p className="text-sm text-gray-500">Konfigurasi pengaturan aplikasi</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
