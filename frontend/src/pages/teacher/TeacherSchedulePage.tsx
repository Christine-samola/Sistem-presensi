import TeacherLayout from '../../layouts/TeacherLayout'
import { Calendar, Clock, BookOpen, MapPin, Play, Plus, Edit, Trash2, X, Search } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useState } from 'react'

interface Kelas {
  id: number
  nama: string
  kode: string
  tingkat: string
}

interface MataPelajaran {
  id: number
  kode: string
  nama: string
}

interface Jadwal {
  id: number
  kelas: number
  kelas_id: number
  kelas_detail?: Kelas
  mata_pelajaran: number | null
  mata_pelajaran_detail?: MataPelajaran
  mapel: string
  mapel_nama: string
  kelas_nama: string
  hari: string
  jam_mulai: string
  jam_selesai: string
  ruang: string
  ruangan?: string
}

interface FormData {
  kelas: number | null
  mata_pelajaran: number | null
  hari: string
  jam_mulai: string
  jam_selesai: string
  ruang: string
}

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Minggu']
const HARI_CHOICES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Minggu']

export default function TeacherSchedulePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [hariFilter, setHariFilter] = useState<string>('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    kelas: null,
    mata_pelajaran: null,
    hari: 'Senin',
    jam_mulai: '07:00',
    jam_selesai: '08:30',
    ruang: ''
  })

  // Fetch jadwal from API
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['teacher-schedules'],
    queryFn: async () => {
      const response = await api.get('/api/jadwal/')
      return response.data as Jadwal[]
    },
    retry: 1,
  })

  // Fetch kelas
  const { data: kelasList } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: async () => {
      const response = await api.get('/api/kelas/')
      return response.data as Kelas[]
    },
    retry: 1,
  })

  // Fetch mata pelajaran
  const { data: mataPelajaranList } = useQuery({
    queryKey: ['mata-pelajaran'],
    queryFn: async () => {
      const response = await api.get('/api/mata-pelajaran/')
      return response.data as MataPelajaran[]
    },
    retry: 1,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/api/jadwal/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-schedules'] })
      toast.success('Jadwal berhasil ditambahkan!')
      closeModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal menambahkan jadwal')
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await api.patch(`/api/jadwal/${id}/`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-schedules'] })
      toast.success('Jadwal berhasil diupdate!')
      closeModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal mengupdate jadwal')
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/jadwal/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-schedules'] })
      toast.success('Jadwal berhasil dihapus!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal menghapus jadwal')
    }
  })

  // Start sesi mutation
  const startSesiMutation = useMutation({
    mutationFn: async (kelasId: number) => {
      const response = await api.post('/api/sesi/', { kelas: kelasId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sesi'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-stats'] })
      toast.success('Sesi presensi berhasil dimulai!')
      navigate('/guru/presensi')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal memulai sesi')
    },
  })

  const openCreateModal = () => {
    setEditMode(false)
    setSelectedId(null)
    setFormData({
      kelas: null,
      mata_pelajaran: null,
      hari: 'Senin',
      jam_mulai: '07:00',
      jam_selesai: '08:30',
      ruang: ''
    })
    setShowModal(true)
  }

  const openEditModal = (jadwal: Jadwal) => {
    setEditMode(true)
    setSelectedId(jadwal.id)
    setFormData({
      kelas: jadwal.kelas,
      mata_pelajaran: jadwal.mata_pelajaran,
      hari: jadwal.hari,
      jam_mulai: jadwal.jam_mulai,
      jam_selesai: jadwal.jam_selesai,
      ruang: jadwal.ruang || ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditMode(false)
    setSelectedId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.kelas || !formData.mata_pelajaran) {
      toast.error('Kelas dan mata pelajaran wajib dipilih')
      return
    }

    if (!formData.jam_mulai || !formData.jam_selesai) {
      toast.error('Jam mulai dan selesai wajib diisi')
      return
    }

    if (editMode && selectedId) {
      updateMutation.mutate({ id: selectedId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleMulaiSesi = (jadwal: Jadwal) => {
    const kelasId = jadwal.kelas || jadwal.kelas_id
    if (!kelasId) {
      toast.error('Kelas ID tidak valid')
      return
    }
    
    if (window.confirm(`Mulai sesi presensi untuk ${jadwal.kelas_nama}?`)) {
      startSesiMutation.mutate(kelasId)
    }
  }

  // Filter schedules
  const filteredSchedules = (schedules || []).filter((jadwal) => {
    const matchesSearch =
      jadwal.mapel_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (jadwal.kelas_detail?.nama || jadwal.kelas_nama).toLowerCase().includes(searchQuery.toLowerCase()) ||
      jadwal.ruang.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesHari = hariFilter === 'ALL' || jadwal.hari === hariFilter

    return matchesSearch && matchesHari
  })

  const groupedSchedules = days.map(day => ({
    day,
    items: filteredSchedules.filter((s: Jadwal) => s.hari === day)
  }))

  return (
    <TeacherLayout currentPage="jadwal">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Jadwal Mengajar</h1>
            <p className="text-sm text-gray-600">Kelola jadwal kelas Anda</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Tambah Jadwal
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari jadwal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            {/* Hari Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={hariFilter}
                onChange={(e) => setHariFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="ALL">Semua Hari</option>
                {HARI_CHOICES.map(hari => (
                  <option key={hari} value={hari}>{hari}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Schedule Content */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat jadwal...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedSchedules.map(({ day, items }) => (
              <div key={day} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{day}</h3>
                    <p className="text-xs text-gray-500">{items.length} jadwal</p>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Tidak ada jadwal
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-center">
                            <div className="flex items-center gap-2 text-blue-600 font-semibold">
                              <Clock className="w-4 h-4" />
                              {schedule.jam_mulai}
                            </div>
                            <div className="text-xs text-gray-500">
                              {schedule.jam_selesai}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                              <BookOpen className="w-4 h-4" />
                              {schedule.mapel_nama || schedule.kelas_nama}
                            </div>
                            <div className="text-sm text-gray-600">
                              {schedule.kelas_detail?.nama || schedule.kelas_nama}
                            </div>
                            {schedule.ruang && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                <MapPin className="w-3 h-3" />
                                {schedule.ruang}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(schedule)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Jadwal"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleMulaiSesi(schedule)}
                            disabled={startSesiMutation.isPending}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {startSesiMutation.isPending ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Memulai...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Mulai Sesi
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal Create/Edit */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editMode ? 'Edit Jadwal' : 'Tambah Jadwal'}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {editMode ? 'Update' : 'Buat'} jadwal mengajar
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-180px)] overflow-y-auto">
                {/* Kelas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kelas || ''}
                    onChange={(e) => setFormData({ ...formData, kelas: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Kelas</option>
                    {(kelasList || []).map(kelas => (
                      <option key={kelas.id} value={kelas.id}>
                        {kelas.nama} (Kelas {kelas.tingkat})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mata Pelajaran */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.mata_pelajaran || ''}
                    onChange={(e) => setFormData({ ...formData, mata_pelajaran: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Mata Pelajaran</option>
                    {(mataPelajaranList || []).map(mapel => (
                      <option key={mapel.id} value={mapel.id}>
                        {mapel.nama} ({mapel.kode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hari */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hari <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.hari}
                    onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {HARI_CHOICES.map(hari => (
                      <option key={hari} value={hari}>{hari}</option>
                    ))}
                  </select>
                </div>

                {/* Jam */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.jam_mulai}
                      onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jam Selesai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.jam_selesai}
                      onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Ruangan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ruangan
                  </label>
                  <input
                    type="text"
                    value={formData.ruang}
                    onChange={(e) => setFormData({ ...formData, ruang: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Lab Komputer 1"
                  />
                </div>
              </form>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Menyimpan...'
                    : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
