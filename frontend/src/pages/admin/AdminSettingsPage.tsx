import { useState, useEffect } from 'react'
import { School, Bell, Shield, Database, Save, Lock } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export default function AdminSettingsPage() {
  const queryClient = useQueryClient()

  // Fetch settings from API
  const { data: settingsData } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await api.get('/api/admin/settings')
      return response.data
    },
    retry: false,
  })

  const [settings, setSettings] = useState({
    schoolName: 'SMA SLADOR',
    schoolAddress: 'Jl. Pendidikan No. 123, Jakarta',
    schoolPhone: '021-12345678',
    schoolEmail: 'admin@smaslador.sch.id',
    enableNotifications: true,
    enableEmailAlerts: false,
    enableSMSAlerts: false,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Update local state when data is fetched
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData)
    }
  }, [settingsData])

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch('/api/admin/settings', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      alert('Pengaturan berhasil disimpan!')
    },
    onError: () => {
      alert('Gagal menyimpan pengaturan')
    }
  })

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { old_password: string; new_password: string }) => {
      const response = await api.patch('/api/auth/me/password', data)
      return response.data
    },
    onSuccess: (data) => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      const message = data?.detail || 'Password berhasil diubah!'
      alert(message)
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail || error?.message || 'Gagal mengubah password'
      alert(message)
    },
  })

  const handleSaveSettings = () => {
    saveMutation.mutate(settings)
  }

  const handleChangePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Mohon lengkapi semua kolom password')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('Konfirmasi password tidak cocok')
      return
    }

    changePasswordMutation.mutate({
      old_password: currentPassword,
      new_password: newPassword,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="text-gray-600 mt-2">Konfigurasi aplikasi dan preferensi sistem</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Save className="w-5 h-5" />
          Simpan Perubahan
        </button>
      </div>

      {/* School Information */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <School className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Informasi Sekolah</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Sekolah
            </label>
            <input
              type="text"
              value={settings.schoolName}
              onChange={(e) => handleInputChange('schoolName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon
            </label>
            <input
              type="text"
              value={settings.schoolPhone}
              onChange={(e) => handleInputChange('schoolPhone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat
            </label>
            <textarea
              value={settings.schoolAddress}
              onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Sekolah
            </label>
            <input
              type="email"
              value={settings.schoolEmail}
              onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Ganti Password Admin</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Saat Ini
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Baru
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleChangePassword}
            disabled={changePasswordMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {changePasswordMutation.isPending ? 'Menyimpan...' : 'Simpan Password'}
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-6 h-6 text-yellow-600" />
          <h2 className="text-xl font-bold text-gray-900">Pengaturan Notifikasi</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Notifikasi Push</p>
              <p className="text-sm text-gray-500">Kirim notifikasi push ke aplikasi mobile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Notifikasi Email</p>
              <p className="text-sm text-gray-500">Kirim notifikasi melalui email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableEmailAlerts}
                onChange={(e) => handleInputChange('enableEmailAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Notifikasi SMS</p>
              <p className="text-sm text-gray-500">Kirim notifikasi melalui SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSMSAlerts}
                onChange={(e) => handleInputChange('enableSMSAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security & Backup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Keamanan</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-left font-medium">
              Ubah Password Admin
            </button>
            <button className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-left font-medium">
              Kelola Sesi Login
            </button>
            <button className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-left font-medium">
              Riwayat Aktivitas
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Backup Data</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors text-left font-medium">
              Backup Database
            </button>
            <button className="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors text-left font-medium">
              Restore dari Backup
            </button>
            <button className="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors text-left font-medium">
              Jadwal Auto Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

