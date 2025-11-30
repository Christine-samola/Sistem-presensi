import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  QrCode, 
  History, 
  Settings,
  LogOut,
  BookOpen
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface TeacherLayoutProps {
  children: ReactNode
  currentPage?: string
}

export default function TeacherLayout({ children, currentPage = 'dashboard' }: TeacherLayoutProps) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar?')) {
      logout()  // ✅ Clear localStorage & state
      navigate('/')  // ✅ Redirect to root
    }
  }

  const menuItems = [
    { path: '/guru', icon: LayoutDashboard, label: 'Buat Kelas', active: currentPage === 'dashboard' },
    { path: '/guru/kelas', icon: Users, label: 'Ruang Kelas', active: currentPage === 'kelas' },
    { path: '/guru/mata-pelajaran', icon: BookOpen, label: 'Mata Pelajaran', active: currentPage === 'mata-pelajaran' },
    { path: '/guru/jadwal', icon: Calendar, label: 'Jadwal', active: currentPage === 'jadwal' },
    { path: '/guru/presensi', icon: QrCode, label: 'Sistem Presensi', active: currentPage === 'presensi' },
    { path: '/guru/riwayat', icon: History, label: 'Riwayat Kehadiran', active: currentPage === 'riwayat' },
    { path: '/guru/pengaturan', icon: Settings, label: 'Pengaturan', active: currentPage === 'pengaturan' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold">A</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">SLADOR</h1>
              <p className="text-xs text-gray-600">Sekolah</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all group
                  ${item.active 
                    ? 'bg-blue-50 text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${item.active ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Section & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Guru'}</p>
              <p className="text-xs text-gray-600 truncate">{user?.email || 'guru@slador.com'}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all text-sm font-semibold"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">SLADOR</h1>
              <p className="text-sm text-gray-600">{menuItems.find(item => item.active)?.label || 'Dashboard'}</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

