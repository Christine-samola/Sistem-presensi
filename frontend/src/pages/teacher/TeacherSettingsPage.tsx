import TeacherLayout from '../../layouts/TeacherLayout'
import { User, Mail, Lock, Save } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState, useEffect } from 'react'

const profileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  nip: z.string().optional(),
})

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Password lama harus diisi'),
  new_password: z.string().min(3, 'Password minimal 3 karakter'),
  confirm_password: z.string().min(3, 'Password minimal 3 karakter'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Password tidak cocok",
  path: ["confirm_password"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function TeacherSettingsPage() {
  const { user, refreshUser } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      nip: user?.nip || '',
    },
  })

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || '',
        email: user.email || '',
        nip: user.nip || '',
      })
    }
  }, [user])

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await api.patch('/api/auth/me', data)
      return response.data
    },
    onSuccess: async () => {
      // Refresh user data in AuthContext
      if (refreshUser) {
        await refreshUser()
      }
      alert('Profil berhasil diperbarui!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal memperbarui profil')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      console.log('Sending change password request:', data)
      const response = await api.patch('/api/auth/me/password', data)
      return response.data
    },
    onSuccess: (data) => {
      console.log('Password change success:', data)
      passwordForm.reset()
      alert('Password berhasil diubah!')
    },
    onError: (error: any) => {
      console.error('Password change error:', error)
      console.error('Error response:', error.response)
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'Gagal mengubah password'
      alert(errorMsg)
    },
  })

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  const onSubmitPassword = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data)
  }

  return (
    <TeacherLayout currentPage="pengaturan">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pengaturan</h1>
          <p className="text-sm text-gray-600">Kelola pengaturan akun Anda</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Profil
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'password'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Ubah Password
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'G'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  {user?.role}
                </span>
              </div>
            </div>

            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  {...profileForm.register('name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Masukkan nama lengkap"
                />
                {profileForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  {...profileForm.register('email')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Masukkan email"
                />
                {profileForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIP
                </label>
                <input
                  type="text"
                  {...profileForm.register('nip')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Masukkan NIP (opsional)"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ubah Password</h3>
              <p className="text-sm text-gray-600">
                Pastikan password baru Anda kuat dan mudah diingat
              </p>
            </div>

            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password Lama
                </label>
                <input
                  type="password"
                  {...passwordForm.register('old_password')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Masukkan password lama"
                />
                {passwordForm.formState.errors.old_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordForm.formState.errors.old_password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  {...passwordForm.register('new_password')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Masukkan password baru"
                />
                {passwordForm.formState.errors.new_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  {...passwordForm.register('confirm_password')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Masukkan ulang password baru"
                />
                {passwordForm.formState.errors.confirm_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {passwordForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengubah...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Ubah Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
