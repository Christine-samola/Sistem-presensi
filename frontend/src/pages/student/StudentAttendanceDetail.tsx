import StudentLayout from '../../layouts/StudentLayout'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Home, CheckCircle2, User, Calendar, Clock, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface AttendanceDetail {
  id: number
  kelas_nama: string
  mata_pelajaran_nama?: string | null
  guru_nama: string
  tanggal: string
  jam_mulai: string
  jam_selesai: string
  waktu_scan: string
  status: 'HADIR' | 'TERLAMBAT' | 'SAKIT' | 'ALPHA'
}

export default function StudentAttendanceDetail() {
  const { id } = useParams<{ id: string }>()
  
  // Fetch attendance detail from API
  const { data: detail, isLoading } = useQuery({
    queryKey: ['student-attendance-detail', id],
    queryFn: async () => {
      const response = await api.get(`/api/siswa/riwayat/${id}/`)
      return response.data as AttendanceDetail
    },
    retry: 1,
    enabled: !!id,
  })
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HADIR':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'TERLAMBAT':
        return <Clock className="w-4 h-4 text-orange-600" />
      case 'SAKIT':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'ALPHA':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
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
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const formatTime = (datetimeString: string) => {
    const date = new Date(datetimeString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat detail...</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (!detail) {
    return (
      <StudentLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Data tidak ditemukan</p>
            <Link to="/siswa/riwayat" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
              Kembali ke riwayat
            </Link>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Back Navigation */}
        <Link
          to="/siswa/riwayat"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 group text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Kembali ke Riwayat</span>
        </Link>

        {/* Attendance Detail Card */}
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
          {/* Subject Header */}
          <div className="gradient-primary px-5 py-3">
            <h1 className="text-lg font-bold text-white">{detail.kelas_nama}</h1>
            {detail.mata_pelajaran_nama && (
              <p className="text-sm text-white/90 mt-1">📚 {detail.mata_pelajaran_nama}</p>
            )}
          </div>

          {/* Detail Content */}
          <div className="p-4 space-y-2">
            {/* Status Row */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  {getStatusIcon(detail.status)}
                </div>
                <span className="font-semibold text-sm text-gray-900">Status</span>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(detail.status)}`}>
                {detail.status}
              </span>
            </div>

            {/* Teacher Row */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-semibold text-sm text-gray-900">Guru</span>
              </div>
              <span className="text-sm text-gray-700">{detail.guru_nama}</span>
            </div>

            {/* Date Row */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-semibold text-sm text-gray-900">Tanggal</span>
              </div>
              <span className="text-sm text-gray-700">{formatDate(detail.tanggal)}</span>
            </div>

            {/* Jadwal Row */}
            <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="font-semibold text-sm text-gray-900">Jadwal</span>
              </div>
              <div className="text-right text-sm">
                <span className="text-gray-700 block">{detail.jam_mulai} - {detail.jam_selesai}</span>
              </div>
            </div>

            {/* Waktu Scan Row */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-semibold text-sm text-gray-900">Waktu Absen</span>
              </div>
              <span className="text-sm text-gray-700">{formatTime(detail.waktu_scan)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center justify-between">
          <Link
            to="/siswa/riwayat"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all group text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Kembali</span>
          </Link>
          <Link
            to="/siswa"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all group text-sm"
          >
            <Home className="w-4 h-4" />
            <span className="font-semibold">Home</span>
          </Link>
        </div>
      </div>
    </StudentLayout>
  )
}
