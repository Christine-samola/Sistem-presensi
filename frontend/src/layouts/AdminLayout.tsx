import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Users, ClipboardList, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar?')) {
      logout()  // ✅ Clear localStorage & state
      navigate('/')  // ✅ Redirect to root
    }
  }

  const menuItems = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: ClipboardList,
    },
    {
      path: '/admin/manajemen-pengguna',
      label: 'Manajemen Pengguna',
      icon: Users,
    },
    {
      path: '/admin/laporan',
      label: 'Laporan Kehadiran',
      icon: ClipboardList,
    },
    {
      path: '/admin/pengaturan',
      label: 'Pengaturan',
      icon: Settings,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SLADOR</h1>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 border-r border-gray-200 min-h-full">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

