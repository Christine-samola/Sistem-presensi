import TeacherLayout from '../../layouts/TeacherLayout'
import { History, Calendar, Users, CheckCircle, XCircle, X, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState } from 'react'

interface RiwayatSesi {
  id: number
  kelas_nama: string
  mata_pelajaran_nama?: string | null
  tanggal: string
  jam_mulai: string
  jam_selesai: string
  total_siswa: number
  hadir: number
  tidak_hadir: number
  persentase_kehadiran: number
}

interface SiswaPresensi {
  siswa_id: number
  nama: string
  nim?: string
  email: string
  status: string | null
  waktu_scan: string | null
  sudah_presensi: boolean
}

export default function TeacherHistoryPage() {
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('week')
  const [selectedSesi, setSelectedSesi] = useState<RiwayatSesi | null>(null)

  // Fetch riwayat sesi from API
  const { data: history, isLoading } = useQuery({
    queryKey: ['teacher-history', filter],
    queryFn: async () => {
      const response = await api.get(`/api/sesi/riwayat/?filter=${filter}`)
      return response.data as RiwayatSesi[]
    },
    retry: 1,
  })

  // Fetch detail siswa untuk sesi yang dipilih
  const { data: detailSiswa, isLoading: loadingDetail } = useQuery({
    queryKey: ['sesi-detail', selectedSesi?.id],
    queryFn: async () => {
      if (!selectedSesi) return []
      const response = await api.get(`/api/sesi/${selectedSesi.id}/daftar_siswa/`)
      return response.data as SiswaPresensi[]
    },
    enabled: !!selectedSesi,
    retry: 1,
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">Belum Presensi</span>
    
    const badges = {
      'HADIR': <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded flex items-center gap-1"><CheckCircle className="w-3 h-3" />Hadir</span>,
      'TERLAMBAT': <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded flex items-center gap-1"><AlertCircle className="w-3 h-3" />Terlambat</span>,
      'IZIN': <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded flex items-center gap-1"><AlertCircle className="w-3 h-3" />Izin</span>,
      'SAKIT': <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded flex items-center gap-1"><AlertCircle className="w-3 h-3" />Sakit</span>,
      'ALPHA': <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded flex items-center gap-1"><XCircle className="w-3 h-3" />Alpha</span>,
    }
    return badges[status] || <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">{status}</span>
  }

  return (
    <TeacherLayout currentPage="riwayat">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Riwayat Kehadiran</h1>
            <p className="text-sm text-gray-600">Lihat riwayat sesi presensi Anda</p>
          </div>
          
          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('week')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Minggu Ini
            </button>
            <button
              onClick={() => setFilter('month')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat riwayat...</p>
          </div>
        ) : history && history.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada riwayat sesi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(history || []).map((sesi) => (
              <div
                key={sesi.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {sesi.kelas_nama}
                    </h3>
                    {sesi.mata_pelajaran_nama && (
                      <p className="text-sm text-blue-600 font-semibold mb-1">
                        📚 {sesi.mata_pelajaran_nama}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(sesi.tanggal)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {sesi.jam_mulai} - {sesi.jam_selesai}
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-semibold ${
                    sesi.persentase_kehadiran >= 90
                      ? 'bg-green-100 text-green-700'
                      : sesi.persentase_kehadiran >= 75
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {sesi.persentase_kehadiran.toFixed(1)}%
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-600">Total Siswa</p>
                      <p className="font-bold text-gray-900">{sesi.total_siswa}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-600">Hadir</p>
                      <p className="font-bold text-green-700">{sesi.hadir}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-600">Tidak Hadir</p>
                      <p className="font-bold text-red-700">{sesi.tidak_hadir}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedSesi(sesi)}
                  className="w-full mt-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors text-sm"
                >
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedSesi && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSesi(null)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Detail Kehadiran</h2>
                  <p className="text-white/80 text-sm">{selectedSesi.kelas_nama}</p>
                  {selectedSesi.mata_pelajaran_nama && (
                    <p className="text-white/90 text-sm">📚 {selectedSesi.mata_pelajaran_nama}</p>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedSesi(null)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                {/* Info Sesi */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Tanggal</p>
                    <p className="font-bold text-gray-900">{formatDate(selectedSesi.tanggal)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Waktu</p>
                    <p className="font-bold text-gray-900">{selectedSesi.jam_mulai} - {selectedSesi.jam_selesai}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedSesi.total_siswa}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">Hadir</p>
                    <p className="text-2xl font-bold text-green-700">{selectedSesi.hadir}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">Tidak Hadir</p>
                    <p className="text-2xl font-bold text-red-700">{selectedSesi.tidak_hadir}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">Persentase</p>
                    <p className="text-2xl font-bold text-blue-700">{selectedSesi.persentase_kehadiran.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Daftar Siswa */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Daftar Siswa</h3>
                  {loadingDetail ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Memuat detail...</p>
                    </div>
                  ) : !detailSiswa || detailSiswa.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Tidak ada data siswa</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {detailSiswa.map((siswa, index) => (
                        <div key={siswa.siswa_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                              siswa.sudah_presensi ? 'bg-green-500' : 'bg-gray-400'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">{siswa.nama}</p>
                              <p className="text-xs text-gray-600">{siswa.nim || siswa.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(siswa.status)}
                            {siswa.waktu_scan && (
                              <span className="text-xs text-gray-500">
                                {new Date(siswa.waktu_scan).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button 
                  onClick={() => setSelectedSesi(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
