import { useState } from 'react'
import { Users, BookOpen, Calendar, Clock, Search, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import StudentLayout from '@/layouts/StudentLayout'

interface Kelas {
  id: number
  nama: string
  kode: string
  tingkat: string
  tahun_ajaran: string
  wali_guru_detail?: {
    id: number
    name: string
    email: string
  }
  jumlah_siswa: number
}

interface Jadwal {
  id: number
  mapel_nama: string
  mata_pelajaran_detail?: {
    kode: string
    nama: string
  }
  hari: string
  jam_mulai: string
  jam_selesai: string
  ruang: string
}

export default function StudentClassPage() {
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch kelas yang diikuti siswa
  const { data: kelasList, isLoading } = useQuery({
    queryKey: ['student-classes'],
    queryFn: async () => {
      const response = await api.get('/api/kelas/')
      return response.data as Kelas[]
    },
    retry: 1,
  })

  // Fetch jadwal untuk kelas yang dipilih
  const { data: jadwalList, isLoading: loadingJadwal } = useQuery({
    queryKey: ['student-jadwal', selectedKelas?.id],
    queryFn: async () => {
      if (!selectedKelas) return []
      const response = await api.get(`/api/jadwal/?kelas_id=${selectedKelas.id}`)
      return response.data as Jadwal[]
    },
    enabled: !!selectedKelas,
    retry: 1,
  })

  const filteredKelas = (kelasList || []).filter((kelas) =>
    kelas.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kelas.kode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group jadwal by hari
  const HARI_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  const groupedJadwal = HARI_ORDER.map(hari => ({
    hari,
    items: (jadwalList || []).filter(j => j.hari === hari)
  })).filter(group => group.items.length > 0)

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelas Saya</h1>
          <p className="text-gray-600">Lihat informasi kelas yang Anda ikuti</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Kelas List */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data kelas...</p>
          </div>
        ) : filteredKelas.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Anda belum terdaftar di kelas manapun</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKelas.map((kelas) => (
              <div
                key={kelas.id}
                onClick={() => setSelectedKelas(kelas)}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    Kelas {kelas.tingkat}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2">{kelas.nama}</h3>
                
                {kelas.wali_guru_detail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    <span>{kelas.wali_guru_detail.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{kelas.jumlah_siswa || 0} siswa</span>
                </div>

                <button className="w-full mt-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors text-sm">
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedKelas && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedKelas(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-5">
                <h2 className="text-2xl font-bold text-white mb-1">{selectedKelas.nama}</h2>
                <p className="text-white/90 text-sm">
                  Kelas {selectedKelas.tingkat} • Tahun Ajaran {selectedKelas.tahun_ajaran}
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-160px)]">
                {/* Informasi Kelas */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Kode Kelas</p>
                    <p className="font-bold text-gray-900">{selectedKelas.kode}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Total Siswa</p>
                    <p className="font-bold text-gray-900">{selectedKelas.jumlah_siswa || 0}</p>
                  </div>
                </div>

                {/* Wali Kelas */}
                {selectedKelas.wali_guru_detail && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-xs text-gray-600 mb-2">Wali Kelas</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedKelas.wali_guru_detail.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{selectedKelas.wali_guru_detail.name}</p>
                        <p className="text-xs text-gray-600">{selectedKelas.wali_guru_detail.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Jadwal Pelajaran */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Jadwal Pelajaran
                  </h3>

                  {loadingJadwal ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Memuat jadwal...</p>
                    </div>
                  ) : groupedJadwal.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Belum ada jadwal untuk kelas ini</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {groupedJadwal.map(({ hari, items }) => (
                        <div key={hari} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Hari Header */}
                          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                            <p className="font-semibold text-gray-900">{hari}</p>
                          </div>

                          {/* Jadwal Items */}
                          <div className="divide-y divide-gray-200">
                            {items.map((jadwal) => (
                              <div
                                key={jadwal.id}
                                className="p-4 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <BookOpen className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900 mb-1">
                                        {jadwal.mapel_nama}
                                      </p>
                                      {jadwal.mata_pelajaran_detail && (
                                        <p className="text-xs text-gray-600 mb-2">
                                          Kode: {jadwal.mata_pelajaran_detail.kode}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-3.5 h-3.5" />
                                          <span>{jadwal.jam_mulai} - {jadwal.jam_selesai}</span>
                                        </div>
                                        {jadwal.ruang && (
                                          <div className="flex items-center gap-1">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                            <span>{jadwal.ruang}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
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
                  onClick={() => setSelectedKelas(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

