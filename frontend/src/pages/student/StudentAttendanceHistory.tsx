import StudentLayout from '../../layouts/StudentLayout'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Search, Calendar, CheckCircle2, Clock, XCircle, Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface AttendanceRecord {
  id: number
  sesi_id: number
  kelas_nama: string
  mata_pelajaran_nama?: string | null
  tanggal: string
  jam_mulai: string
  jam_selesai: string
  waktu_scan: string
  status: 'HADIR' | 'TERLAMBAT' | 'SAKIT' | 'ALPHA'
  guru_nama: string
}

export default function StudentAttendanceHistory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Fetch attendance records from API
  const { data: records, isLoading } = useQuery({
    queryKey: ['student-attendance-history'],
    queryFn: async () => {
      const response = await api.get('/api/siswa/riwayat/')
      return response.data as AttendanceRecord[]
    },
    retry: 1,
  })

  const filteredRecords = (records || []).filter(record => {
    const matchesSearch = record.kelas_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.guru_nama.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus.toUpperCase()
    return matchesSearch && matchesStatus
  })

  const stats = {
    present: (records || []).filter(r => r.status === 'HADIR').length,
    late: (records || []).filter(r => r.status === 'TERLAMBAT').length,
    sick: (records || []).filter(r => r.status === 'SAKIT').length,
    absent: (records || []).filter(r => r.status === 'ALPHA').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HADIR':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'TERLAMBAT':
        return <Clock className="w-5 h-5 text-orange-600" />
      case 'SAKIT':
        return <Activity className="w-5 h-5 text-yellow-600" />
      case 'ALPHA':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HADIR':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'TERLAMBAT':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'SAKIT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ALPHA':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', { 
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Riwayat Kehadiran
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600">{filteredRecords.length} records</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex h-20">
              <div className="w-16 bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 px-3 py-2 flex flex-col justify-center items-end">
                <p className="text-xs text-gray-600">Hadir</p>
                <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex h-20">
              <div className="w-16 bg-orange-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1 px-3 py-2 flex flex-col justify-center items-end">
                <p className="text-xs text-gray-600">Terlambat</p>
                <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex h-20">
              <div className="w-16 bg-yellow-50 flex items-center justify-center">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1 px-3 py-2 flex flex-col justify-center items-end">
                <p className="text-xs text-gray-600">Sakit</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sick}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex h-20">
              <div className="w-16 bg-red-50 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 px-3 py-2 flex flex-col justify-center items-end">
                <p className="text-xs text-gray-600">Alpha</p>
                <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="glass-effect rounded-xl shadow-xl border border-white/20 p-4 backdrop-blur-md space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan kelas atau guru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-600">Filter:</span>
            {['all', 'hadir', 'terlambat', 'sakit', 'alpha'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`
                  px-3 py-1 rounded-full text-xs font-semibold transition-all
                  ${filterStatus === status 
                    ? 'gradient-primary text-white shadow-sm' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                {status === 'all' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Attendance Records List */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat riwayat...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRecords.length === 0 ? (
              <div className="glass-effect rounded-xl shadow-xl border border-white/20 p-8 text-center backdrop-blur-md">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Tidak ada riwayat kehadiran</p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <Link
                  key={record.id}
                  to={`/siswa/riwayat/${record.id}`}
                  className="group block glass-effect rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl hover:border-blue-500/30 transition-all backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(record.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-gray-900 truncate">{record.kelas_nama}</h3>
                        {record.mata_pelajaran_nama && (
                          <p className="text-xs text-blue-600 font-semibold truncate">
                            📚 {record.mata_pelajaran_nama}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(record.tanggal)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {record.jam_mulai} - {record.jam_selesai}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(record.status)} whitespace-nowrap`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
