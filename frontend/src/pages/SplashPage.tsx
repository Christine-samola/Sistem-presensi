import { Link } from 'react-router-dom'
import { User, Sparkles } from 'lucide-react'

export default function SplashPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Logo Section */}
      <div className="mb-12 flex flex-col items-center relative z-10">
        <div className="relative mb-6 group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative w-24 h-24 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
            <span className="text-5xl font-bold text-white">A</span>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex justify-center gap-1">
            <div className="h-1 w-10 bg-yellow-400 rounded-full transform -rotate-12 shadow-lg"></div>
            <div className="h-1 w-8 bg-yellow-400 rounded-full transform -rotate-6 shadow-lg"></div>
            <div className="h-1 w-6 bg-yellow-400 rounded-full shadow-lg"></div>
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
          SLA DOYO BARU
        </h1>
        <p className="text-gray-600 mt-2 font-medium">School Attendance System</p>
      </div>

      {/* Info Card */}
      <div className="w-full max-w-md mb-10 relative z-10">
        <div className="glass-effect rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Welcome</p>
          </div>
          <div className="space-y-2.5">
            <div className="h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full w-full animate-pulse"></div>
            <div className="h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full w-5/6 animate-pulse animation-delay-300"></div>
            <div className="h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full w-4/6 animate-pulse animation-delay-600"></div>
            <div className="h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full w-3/4 animate-pulse animation-delay-900"></div>
            <div className="h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full w-full animate-pulse animation-delay-1200"></div>
          </div>
        </div>
      </div>

      {/* Login Button */}
      <div className="w-full max-w-md relative z-10">
        <Link
          to="/login"
          className="group glass-effect rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/30 flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <span className="font-bold text-gray-800 block text-xl">LOGIN</span>
            <span className="text-sm text-gray-500 mt-1">Masuk ke sistem presensi</span>
          </div>
        </Link>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .animation-delay-900 {
          animation-delay: 0.9s;
        }
        .animation-delay-1200 {
          animation-delay: 1.2s;
        }
      `}</style>
    </div>
  )
}


