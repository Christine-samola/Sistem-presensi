import TeacherLayout from '../../layouts/TeacherLayout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, BookOpen, Users, Calendar, ClipboardCheck } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

const createClassSchema = z.object({
  nama: z.string().min(3, 'Nama kelas minimal 3 karakter'),
  tingkat: z.string().min(1, 'Tingkat wajib diisi'),
  tahun_ajaran: z.string().min(1, 'Tahun ajaran wajib diisi'),
})

type CreateClassFormData = z.infer<typeof createClassSchema>

interface Stats {
  totalKelas: number
  totalSiswa: number
  jadwalHariIni: number
  sesiAktif: number
}

export default function TeacherDashboard() {
  const [showForm, setShowForm] = useState(false)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClassFormData>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      tahun_ajaran: '2024/2025',
    },
  })

  // Fetch stats from API
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['teacher-stats'],
    queryFn: async () => {
      const response = await api.get('/api/guru/statistics/')
      return response.data as Stats
    },
    retry: 1,
  })

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (data: CreateClassFormData) => {
      const response = await api.post('/api/kelas/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-classes'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-stats'] })
      reset()
      setShowForm(false)
      alert('Kelas berhasil dibuat!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal membuat kelas')
    },
  })

  const onSubmit = (data: CreateClassFormData) => {
    createClassMutation.mutate(data)
  }

  const statsCards = [
    {
      title: 'Total Kelas',
      value: stats?.totalKelas || 0,
      icon: BookOpen,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Siswa',
      value: stats?.totalSiswa || 0,
      icon: Users,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Jadwal Hari Ini',
      value: stats?.jadwalHariIni || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Sesi Aktif',
      value: stats?.sesiAktif || 0,
      icon: ClipboardCheck,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ]

  return (
    <TeacherLayout currentPage="dashboard">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Guru</h1>
            <p className="text-sm text-gray-600">Selamat datang, {user?.name || 'Guru'}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Tutup Form' : 'Buat Kelas'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Create Class Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Buat Kelas Baru</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nama Kelas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  {...register('nama')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                  placeholder="Contoh: Matematika, Fisika, Bahasa Indonesia"
                />
                {errors.nama && (
                  <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>
                )}
              </div>

              {/* Tingkat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tingkat Kelas
                </label>
                <select
                  {...register('tingkat')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                >
                  <option value="">Pilih tingkat</option>
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>
                {errors.tingkat && (
                  <p className="text-red-500 text-xs mt-1">{errors.tingkat.message}</p>
                )}
              </div>

              {/* Tahun Ajaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  {...register('tahun_ajaran')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                  placeholder="Contoh: 2024/2025"
                />
                {errors.tahun_ajaran && (
                  <p className="text-red-500 text-xs mt-1">{errors.tahun_ajaran.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createClassMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createClassMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Membuat...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Buat Kelas
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Quick Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tips:</strong> Setelah membuat kelas, Anda dapat mengelola jadwal dan memulai sesi presensi untuk kelas tersebut.
          </p>
        </div>
      </div>
    </TeacherLayout>
  )
}

