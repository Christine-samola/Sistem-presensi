import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  QrCode, 
  History, 
  User, 
  LogOut,
  Menu,
  Users
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

interface StudentLayoutProps {
  children: ReactNode
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout, user } = useAuth()

  const menuItems = [
    { path: '/siswa', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/siswa/kelas', icon: Users, label: 'Kelas' },
    { path: '/siswa/scan', icon: QrCode, label: 'Presensi' },
    { path: '/siswa/riwayat', icon: History, label: 'Riwayat' },
    { path: '/siswa/profil', icon: User, label: 'Profil' },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    setSidebarOpen(false)
    
    if (window.confirm('Yakin ingin keluar?')) {
      logout()  // ✅ Clear localStorage & state
      navigate('/')  // ✅ Redirect to root
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-effect transform transition-transform duration-300 ease-in-out shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">SLADOR</h1>
                <p className="text-xs text-gray-600 font-medium">Sekolah</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Siswa'}</p>
                <p className="text-xs text-gray-600">{user?.email || 'siswa@slador.com'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                        ${active 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30' 
                          : 'text-gray-700 hover:bg-white/50 backdrop-blur-sm'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${active ? '' : 'group-hover:scale-110 transition-transform'}`} />
                      <span className="font-semibold">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Manual Card */}
          <div className="p-4 border-t border-white/20">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                📚 User Manual
              </h3>
              <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                Comprehensive guide to help you navigate through the system
              </p>
              <button className="w-full text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg px-3 py-2 hover:shadow-lg transition-all transform hover:scale-105">
                Read More →
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/20">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all font-semibold hover:shadow-md"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden">
          {/* White Main Header */}
          <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all mr-2"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold">A</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-base">SLADOR</h1>
                <p className="text-xs text-gray-600">Sekolah</p>
              </div>
            </div>
          </header>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

