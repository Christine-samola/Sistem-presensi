import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'

export type User = {
  id: number
  username: string
  email: string
  name?: string
  role: 'ADMIN' | 'GURU' | 'SISWA'
  is_active: boolean
  nip?: string
  nim?: string
}

type AuthContextType = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load auth state from localStorage on mount
    const at = localStorage.getItem('access_token')
    const rt = localStorage.getItem('refresh_token')
    const u = localStorage.getItem('auth_user')
    if (at && rt && u) {
      setAccessToken(at)
      setRefreshToken(rt)
      try {
        setUser(JSON.parse(u))
      } catch {
        setUser(null)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password })
    const { access_token, refresh_token, user: u } = res.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('auth_user', JSON.stringify(u))
    setAccessToken(access_token)
    setRefreshToken(refresh_token)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const res = await api.get('/api/auth/me')
      const updatedUser = res.data
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value = useMemo(
    () => ({ user, accessToken, refreshToken, login, logout, refreshUser, isLoading }), 
    [user, accessToken, refreshToken, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
