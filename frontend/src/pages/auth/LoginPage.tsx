import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login, user, isLoading } = useAuth()
  
  // Redirect jika sudah login
  useEffect(() => {
    if (!isLoading && user) {
      // Redirect ke dashboard sesuai role
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else if (user.role === 'GURU') {
        navigate('/guru', { replace: true })
      } else if (user.role === 'SISWA') {
        navigate('/siswa', { replace: true })
      }
    }
  }, [user, isLoading, navigate])
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      await login(data.email, data.password)
      // Get role from user state or localStorage
      const currentUser = user || JSON.parse(localStorage.getItem('auth_user') || '{}')
      const role = currentUser.role
      
      // Redirect berdasarkan role
      if (role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else if (role === 'GURU') {
        navigate('/guru', { replace: true })
      } else if (role === 'SISWA') {
        navigate('/siswa', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (e: any) {
      setErrorMsg('Login gagal. Periksa email/password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 relative">
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>

        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <span className="text-4xl font-bold text-white">A</span>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex justify-center gap-1">
              <div className="h-1 w-8 bg-yellow-400 rounded-full transform -rotate-12 shadow-lg"></div>
              <div className="h-1 w-6 bg-yellow-400 rounded-full transform -rotate-6 shadow-lg"></div>
              <div className="h-1 w-4 bg-yellow-400 rounded-full shadow-lg"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            SLA DOYO BARU
          </h1>
          <p className="text-gray-600 mt-2">School Attendance System</p>
        </div>

        {/* Login Form */}
        <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errorMsg && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}
            {/* Email Field */}
            <div>
              <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                <Mail className="w-5 h-5 text-blue-600" />
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                <Lock className="w-5 h-5 text-blue-600" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'SIGNING IN…' : 'LOGIN'}
            </button>
          </form>
        </div>

        {/* Link to Register */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold">
              Contact administrator
            </Link>
          </p>
        </div>
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
      `}</style>
    </div>
  )
}
