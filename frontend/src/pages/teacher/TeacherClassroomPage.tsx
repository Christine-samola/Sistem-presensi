import TeacherLayout from '../../layouts/TeacherLayout'
import { Link } from 'react-router-dom'
import { Users, Plus, Search, X, Mail, UserPlus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Kelas {
  id: number
  nama: string
  tingkat: string
  tahun_ajaran: string
  guru_id?: number
  guru_nama?: string
  jumlah_siswa?: number
  kode?: string
}

interface SiswaKelas {
  id: number
  siswa: number
  siswa_detail: {
    id: number
    name: string
    email: string
    nim?: string
  }
}

interface AvailableStudent {
  id: number
  name: string
  email: string
  nim?: string
}

export default function TeacherClassroomPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  
  const queryClient = useQueryClient()

  // Fetch kelas from API
  const { data: classrooms, isLoading } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: async () => {
      const response = await api.get('/api/kelas/')
      return response.data as Kelas[]
    },
    retry: 1,
  })

  const filteredClassrooms = (classrooms || []).filter((cls: Kelas) => 
    cls.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.tingkat.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Fetch siswa in selected kelas
  const { data: siswaList, isLoading: loadingSiswa, refetch: refetchSiswa } = useQuery({
    queryKey: ['kelas-siswa', selectedKelas?.id],
    queryFn: async () => {
      if (!selectedKelas) return []
      const response = await api.get(`/api/kelas/${selectedKelas.id}/`)
      return response.data.anggota || []
    },
    enabled: !!selectedKelas,
    retry: 1,
  })

  // Fetch available students (not in this class)
  const { data: availableStudents, isLoading: loadingAvailable } = useQuery({
    queryKey: ['available-students', selectedKelas?.id],
    queryFn: async () => {
      if (!selectedKelas) return []
      const response = await api.get(`/api/kelas/${selectedKelas.id}/available_students/`)
      return response.data as AvailableStudent[]
    },
    enabled: !!selectedKelas && showAddStudentModal,
    retry: 1,
  })

  // Add student to class mutation
  const addStudentMutation = useMutation({
    mutationFn: async ({ kelasId, siswaId }: { kelasId: number; siswaId: number }) => {
      const response = await api.post(`/api/kelas/${kelasId}/anggota/`, {
        siswa: siswaId
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas-siswa'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] })
      queryClient.invalidateQueries({ queryKey: ['available-students'] })
      refetchSiswa()
      toast.success('Siswa berhasil ditambahkan ke kelas!')
      setShowAddStudentModal(false)
      setSelectedStudent(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal menambahkan siswa')
    }
  })

  // Remove student from class mutation
  const removeStudentMutation = useMutation({
    mutationFn: async ({ kelasId, siswaId }: { kelasId: number; siswaId: number }) => {
      const response = await api.delete(`/api/kelas/${kelasId}/remove_student/?siswa_id=${siswaId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kelas-siswa'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] })
      refetchSiswa()
      toast.success('Siswa berhasil dihapus dari kelas!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal menghapus siswa')
    }
  })

  const handleAddStudent = () => {
    if (!selectedKelas || !selectedStudent) {
      toast.error('Pilih siswa terlebih dahulu')
      return
    }
    
    addStudentMutation.mutate({
      kelasId: selectedKelas.id,
      siswaId: selectedStudent
    })
  }

  const handleRemoveStudent = (siswaId: number) => {
    if (!selectedKelas) return
    
    if (confirm('Apakah Anda yakin ingin menghapus siswa dari kelas ini?')) {
      removeStudentMutation.mutate({
        kelasId: selectedKelas.id,
        siswaId: siswaId
      })
    }
  }

  const filteredAvailableStudents = (availableStudents || []).filter((student: AvailableStudent) =>
    student.name?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    student.nim?.toLowerCase().includes(studentSearchQuery.toLowerCase())
  )

  return (
    <TeacherLayout currentPage="kelas">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ruang Kelas</h1>
            <p className="text-sm text-gray-600">Kelola kelas Anda di sini</p>
          </div>
          <Link
            to="/guru"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Buat Kelas
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ruang kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Classrooms Grid */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data kelas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClassrooms.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Tidak ada ruang kelas ditemukan</p>
                <Link 
                  to="/guru" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Buat kelas pertama Anda
                </Link>
              </div>
            ) : (
              filteredClassrooms.map((classroom) => (
                <div
                  key={classroom.id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      Kelas {classroom.tingkat}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{classroom.nama}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{classroom.jumlah_siswa || 0} siswa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{classroom.tahun_ajaran}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => setSelectedKelas(classroom)}
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 rounded-lg transition-colors text-sm"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Detail Modal */}
        {selectedKelas && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedKelas(null)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedKelas.nama}</h2>
                  <p className="text-white/80 text-sm">Kelas {selectedKelas.tingkat} • {selectedKelas.tahun_ajaran}</p>
                </div>
                <button 
                  onClick={() => setSelectedKelas(null)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                {/* Kelas Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Kode Kelas</p>
                    <p className="font-bold text-gray-900">{selectedKelas.kode || '-'}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Total Siswa</p>
                    <p className="font-bold text-gray-900">{selectedKelas.jumlah_siswa || 0}</p>
                  </div>
                </div>

                {/* Siswa List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Daftar Siswa
                    </h3>
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Tambah Siswa
                    </button>
                  </div>
                  
                  {loadingSiswa ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Memuat daftar siswa...</p>
                    </div>
                  ) : !siswaList || siswaList.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Belum ada siswa di kelas ini</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {siswaList.map((item: SiswaKelas, index: number) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {item.siswa_detail?.name?.charAt(0).toUpperCase() || index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.siswa_detail?.name || 'Unknown'}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Mail className="w-3 h-3" />
                              {item.siswa_detail?.email || '-'}
                            </div>
                          </div>
                          {item.siswa_detail?.nim && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {item.siswa_detail.nim}
                            </span>
                          )}
                          <button
                            onClick={() => handleRemoveStudent(item.siswa)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus siswa dari kelas"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
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

        {/* Add Student Modal */}
        {showAddStudentModal && selectedKelas && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddStudentModal(false)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Tambah Siswa ke Kelas</h2>
                  <p className="text-white/80 text-sm">{selectedKelas.nama}</p>
                </div>
                <button 
                  onClick={() => setShowAddStudentModal(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-160px)]">
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari siswa berdasarkan nama, email, atau NIM..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Student List */}
                {loadingAvailable ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Memuat daftar siswa...</p>
                  </div>
                ) : filteredAvailableStudents.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {studentSearchQuery 
                        ? 'Tidak ada siswa yang cocok dengan pencarian'
                        : 'Semua siswa sudah terdaftar di kelas ini'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredAvailableStudents.map((student: AvailableStudent) => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedStudent === student.id
                            ? 'bg-blue-50 border-2 border-blue-500'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {student.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Mail className="w-3 h-3" />
                            {student.email}
                          </div>
                        </div>
                        {student.nim && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {student.nim}
                          </span>
                        )}
                        {selectedStudent === student.id && (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddStudentModal(false)
                    setSelectedStudent(null)
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleAddStudent}
                  disabled={!selectedStudent || addStudentMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {addStudentMutation.isPending ? 'Menambahkan...' : 'Tambahkan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
