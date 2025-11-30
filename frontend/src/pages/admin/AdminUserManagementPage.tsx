import { useState } from 'react'
import { Users, Search, Plus, Edit, Trash2, Filter, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'

type UserRole = 'SISWA' | 'GURU' | 'ADMIN' | 'ALL'

interface User {
  id: number
  username: string
  name: string
  email: string
  role: 'SISWA' | 'GURU' | 'ADMIN'
  nim?: string
  nip?: string
  is_active: boolean
}

interface CreateUserData {
  username: string
  email: string
  name: string
  role: 'SISWA' | 'GURU' | 'ADMIN'
  password: string
  nim?: string
  nip?: string
  is_active: boolean
}

type ModalMode = 'create' | 'edit'

const createInitialFormData = (): CreateUserData => ({
  username: '',
  email: '',
  name: '',
  role: 'SISWA',
  password: '',
  nim: '',
  nip: '',
  is_active: true
})

export default function AdminUserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole>('ALL')
  const [modalMode, setModalMode] = useState<ModalMode | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CreateUserData>(createInitialFormData())
  
  const queryClient = useQueryClient()

  // Fetch users data from API
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter],
    queryFn: async () => {
      const endpoint = roleFilter === 'ALL' 
        ? '/api/users/list/' 
        : `/api/users/list/?role=${roleFilter}`
      const response = await api.get(endpoint)
      return response.data as User[]
    },
    retry: 1,
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await api.post('/api/users/list/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Pengguna berhasil ditambahkan!')
      closeModal()
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal menambahkan pengguna')
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateUserData> }) => {
      const payload = { ...data }
      if (!payload.password) {
        delete payload.password
      }
      const response = await api.patch(`/api/users/list/${id}/`, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Pengguna berhasil diperbarui!')
      closeModal()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal memperbarui pengguna')
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/users/list/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Pengguna berhasil dihapus!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Gagal menghapus pengguna')
    }
  })

  const resetForm = () => {
    setFormData(createInitialFormData())
    setSelectedUser(null)
  }

  const closeModal = () => {
    setModalMode(null)
    resetForm()
  }

  const openCreateModal = () => {
    resetForm()
    setModalMode('create')
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setFormData({
      username: user.username || '',
      email: user.email || '',
      name: user.name || '',
      role: user.role,
      password: '',
      nim: user.nim || '',
      nip: user.nip || '',
      is_active: user.is_active
    })
    setModalMode('edit')
  }

  const handleDelete = (user: User) => {
    const confirmation = window.confirm(`Apakah Anda yakin ingin menghapus pengguna ${user.name}?`)
    if (confirmation) {
      deleteUserMutation.mutate(user.id)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalMode) {
      return
    }

    // Validation
    if (!formData.username || !formData.email || !formData.name) {
      toast.error('Mohon lengkapi semua field yang wajib')
      return
    }

    if (modalMode === 'create' && !formData.password) {
      toast.error('Mohon isi password untuk pengguna baru')
      return
    }
    
    if (formData.role === 'SISWA' && !formData.nim) {
      toast.error('NIM wajib diisi untuk siswa')
      return
    }
    
    if (formData.role === 'GURU' && !formData.nip) {
      toast.error('NIP wajib diisi untuk guru')
      return
    }

    if (modalMode === 'create') {
      createUserMutation.mutate({
        ...formData,
        nim: formData.role === 'SISWA' ? formData.nim : '',
        nip: formData.role === 'GURU' ? formData.nip : ''
      })
      return
    }

    if (modalMode === 'edit' && selectedUser) {
      const payload: Partial<CreateUserData> = {
        username: formData.username,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        is_active: formData.is_active,
        nim: formData.role === 'SISWA' ? formData.nim : '',
        nip: formData.role === 'GURU' ? formData.nip : ''
      }

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password
      }

      updateUserMutation.mutate({ id: selectedUser.id, data: payload })
    }
  }

  // Filter users berdasarkan search query
  const filteredUsers = (users || []).filter((user: User) => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-600 mt-2">Kelola data siswa, guru, dan admin</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Tambah Pengguna
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">Semua Role</option>
              <option value="SISWA">Siswa</option>
              <option value="GURU">Guru</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data pengguna
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{user.nim || user.nip || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.email || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'GURU'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => openEditModal(user)}
                      >
                          <Edit className="w-5 h-5" />
                        </button>
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(user)}
                        disabled={deleteUserMutation.isPending}
                      >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Siswa</p>
              <p className="text-2xl font-bold text-gray-900">
                {(users || []).filter((u: User) => u.role === 'SISWA').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Guru</p>
              <p className="text-2xl font-bold text-gray-900">
                {(users || []).filter((u: User) => u.role === 'GURU').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Admin</p>
              <p className="text-2xl font-bold text-gray-900">
                {(users || []).filter((u: User) => u.role === 'ADMIN').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {modalMode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
                </h2>
                <p className="text-white/80 text-sm">
                  {modalMode === 'create' ? 'Isi form untuk menambahkan pengguna' : 'Perbarui data pengguna'}
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
            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                <div className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as 'SISWA' | 'GURU' | 'ADMIN'})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="SISWA">Siswa</option>
                      <option value="GURU">Guru</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Masukkan username"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Masukkan email"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password {modalMode === 'create' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={modalMode === 'create' ? 'Masukkan password' : 'Kosongkan jika tidak ingin mengubah password'}
                      required={modalMode === 'create'}
                    />
                  </div>

                  {/* NIM (for SISWA) */}
                  {formData.role === 'SISWA' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NIM <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.nim}
                        onChange={(e) => setFormData({...formData, nim: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan NIM"
                        required
                      />
                    </div>
                  )}

                  {/* NIP (for GURU) */}
                  {formData.role === 'GURU' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NIP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.nip}
                        onChange={(e) => setFormData({...formData, nip: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan NIP"
                        required
                      />
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Aktif</span>
                    </label>
                  </div>
                </div>
              </div>

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
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {createUserMutation.isPending || updateUserMutation.isPending
                    ? 'Menyimpan...'
                    : modalMode === 'create'
                    ? 'Simpan'
                    : 'Perbarui'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

