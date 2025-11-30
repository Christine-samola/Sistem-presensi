import { useState } from 'react'
import { BookOpen, Plus, Search, Edit, Trash2, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import TeacherLayout from '@/layouts/TeacherLayout'

interface MataPelajaran {
  id: number
  kode: string
  nama: string
  deskripsi: string
  guru: number | null
  guru_detail?: {
    id: number
    name: string
  }
  is_active: boolean
  created_at: string
}

interface FormData {
  kode: string
  nama: string
  deskripsi: string
  is_active: boolean
}

export default function TeacherSubjectPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    kode: '',
    nama: '',
    deskripsi: '',
    is_active: true
  })

  const queryClient = useQueryClient()

  // Fetch mata pelajaran
  const { data: subjects, isLoading } = useQuery({
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
      const response = await api.post('/api/mata-pelajaran/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mata-pelajaran'] })
      toast.success('Mata pelajaran berhasil ditambahkan!')
      closeModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal menambahkan mata pelajaran')
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await api.patch(`/api/mata-pelajaran/${id}/`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mata-pelajaran'] })
      toast.success('Mata pelajaran berhasil diupdate!')
      closeModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal mengupdate mata pelajaran')
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/mata-pelajaran/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mata-pelajaran'] })
      toast.success('Mata pelajaran berhasil dihapus!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal menghapus mata pelajaran')
    }
  })

  const openCreateModal = () => {
    setEditMode(false)
    setSelectedId(null)
    setFormData({
      kode: '',
      nama: '',
      deskripsi: '',
      is_active: true
    })
    setShowModal(true)
  }

  const openEditModal = (subject: MataPelajaran) => {
    setEditMode(true)
    setSelectedId(subject.id)
    setFormData({
      kode: subject.kode,
      nama: subject.nama,
      deskripsi: subject.deskripsi,
      is_active: subject.is_active
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditMode(false)
    setSelectedId(null)
    setFormData({
      kode: '',
      nama: '',
      deskripsi: '',
      is_active: true
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.kode || !formData.nama) {
      toast.error('Kode dan nama mata pelajaran wajib diisi')
      return
    }

    if (editMode && selectedId) {
      updateMutation.mutate({ id: selectedId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
      deleteMutation.mutate(id)
    }
  }

  const filteredSubjects = (subjects || []).filter((subject) =>
    subject.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.kode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <TeacherLayout currentPage="mata-pelajaran">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mata Pelajaran</h1>
            <p className="text-sm text-gray-600">Kelola mata pelajaran yang Anda ampu</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Tambah Mata Pelajaran
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari mata pelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Subjects List */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Tidak ada mata pelajaran</p>
            <button
              onClick={openCreateModal}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Tambah mata pelajaran pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{subject.nama}</h3>
                      <p className="text-sm text-gray-600">{subject.kode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(subject)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {subject.deskripsi && (
                  <p className="text-sm text-gray-600 mb-3">{subject.deskripsi}</p>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      subject.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {subject.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
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
                    {editMode ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
                  </h2>
                  <p className="text-white/80 text-sm">
                    Isi form untuk {editMode ? 'mengupdate' : 'menambahkan'} mata pelajaran
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
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Kode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: MAT-101"
                    required
                  />
                </div>

                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Matematika"
                    required
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Deskripsi singkat mata pelajaran"
                    rows={3}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                  </label>
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

