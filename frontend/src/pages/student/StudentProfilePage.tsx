import StudentLayout from '../../layouts/StudentLayout'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  User, 
  Save, 
  Lock, 
  CheckCircle2,
  Eye,
  EyeOff,
  Mail
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

const profileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  nim: z.string().optional(),
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

export default function StudentProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { user, refreshUser } = useAuth()
  const queryClient = useQueryClient()
  
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      nim: user?.nim || '',
    },
  })

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || '',
        email: user.email || '',
        nim: user.nim || '',
      })
    }
  }, [user])

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      console.log('Sending profile update:', data)
      const response = await api.patch('/api/auth/me', data)
      console.log('Profile update response:', response.data)
      return response.data
    },
    onSuccess: async () => {
      // Refresh user data in AuthContext
      if (refreshUser) {
        await refreshUser()
      }
      alert('Profil berhasil diperbarui!')
      queryClient.invalidateQueries({ queryKey: ['auth-user'] })
    },
    onError: (error: any) => {
      console.error('Profile update error:', error)
      console.error('Error response:', error.response)
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Gagal memperbarui profil'
      alert(errorMsg)
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await api.patch('/api/auth/me/password', data)
      return response.data
    },
    onSuccess: () => {
      passwordForm.reset()
      alert('Password berhasil diubah!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Gagal mengubah password')
    },
  })

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  const onSubmitPassword = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data)
  }

  const renderProfileTab = () => (
    <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
      {/* Profile Picture Section */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase() || 'S'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <User className="w-3 h-3 inline mr-1" />
            Nama Lengkap
          </label>
          <input
            type="text"
            {...profileForm.register('name')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan nama lengkap"
          />
          {profileForm.formState.errors.name && (
            <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            <Mail className="w-3 h-3 inline mr-1" />
            Email
          </label>
          <input
            type="email"
            {...profileForm.register('email')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan email"
          />
          {profileForm.formState.errors.email && (
            <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            NIM (Opsional)
          </label>
          <input
            type="text"
            {...profileForm.register('nim')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            placeholder="Masukkan NIM"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">NIM tidak dapat diubah</p>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={updateProfileMutation.isPending}
        className="w-full gradient-primary text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {updateProfileMutation.isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </>
        )}
      </button>
    </form>
  )

  const renderPasswordTab = () => (
    <div className="space-y-4">
      {/* Password Requirements Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h3 className="font-semibold text-sm text-gray-900 mb-1">Informasi Penting</h3>
        <p className="text-xs text-gray-700">
          Password harus minimal 6 karakter dan mengandung kombinasi huruf dan angka untuk keamanan.
        </p>
      </div>

      {/* Password Form */}
      <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Password Lama</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              {...passwordForm.register('old_password')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              placeholder="Masukkan password lama"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordForm.formState.errors.old_password && (
            <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.old_password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Password Baru</label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              {...passwordForm.register('new_password')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              placeholder="Masukkan password baru"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordForm.formState.errors.new_password && (
            <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.new_password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Konfirmasi Password Baru</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...passwordForm.register('confirm_password')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              placeholder="Masukkan ulang password baru"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordForm.formState.errors.confirm_password && (
            <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirm_password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="w-full gradient-primary text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {changePasswordMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Mengubah...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Ubah Password
            </>
          )}
        </button>
      </form>
    </div>
  )

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil & Pengaturan</h1>
          <p className="text-sm text-gray-600">Kelola data akun Anda</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-2 px-3 text-sm font-semibold transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-3 h-3 inline mr-1" />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`pb-2 px-3 text-sm font-semibold transition-colors ${
                activeTab === 'password'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lock className="w-3 h-3 inline mr-1" />
              Password
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'password' && renderPasswordTab()}
        </div>
      </div>
    </StudentLayout>
  )
}
