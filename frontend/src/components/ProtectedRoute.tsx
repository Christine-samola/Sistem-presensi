import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { User } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: User['role'][]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [],
  redirectTo
}: ProtectedRouteProps) {
  const { user, accessToken, isLoading } = useAuth()

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  // Check if user is logged in
  const isAuthenticated = !!accessToken && !!user

  // If not authenticated, redirect to appropriate login page
  if (!isAuthenticated) {
    // Use provided redirectTo or determine based on allowed roles
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />
    }
    // Fallback: redirect to root if no specific redirect specified
    return <Navigate to="/" replace />
  }

  // If roles are specified, check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect based on user's actual role (not allowed role)
    if (user.role === 'SISWA') {
      return <Navigate to="/siswa" replace />
    }
    if (user.role === 'GURU') {
      return <Navigate to="/guru" replace />
    }
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />
    }
    // Fallback to root
    return <Navigate to="/" replace />
  }

  // User is authenticated and has correct role
  return <>{children}</>
}

