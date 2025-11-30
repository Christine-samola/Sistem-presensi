import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import SplashPage from './pages/SplashPage'
import LoginPage from './pages/auth/LoginPage'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentClassPage from './pages/student/StudentClassPage'
import StudentScanPage from './pages/student/StudentScanPage'
import StudentAttendanceHistory from './pages/student/StudentAttendanceHistory'
import StudentAttendanceDetail from './pages/student/StudentAttendanceDetail'
import StudentProfilePage from './pages/student/StudentProfilePage'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherClassroomPage from './pages/teacher/TeacherClassroomPage'
import TeacherSchedulePage from './pages/teacher/TeacherSchedulePage'
import TeacherSubjectPage from './pages/teacher/TeacherSubjectPage'
import TeacherAttendanceSystemPage from './pages/teacher/TeacherAttendanceSystemPage'
import TeacherHistoryPage from './pages/teacher/TeacherHistoryPage'
import TeacherSettingsPage from './pages/teacher/TeacherSettingsPage'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUserManagementPage from './pages/admin/AdminUserManagementPage'
import AdminAttendanceReportPage from './pages/admin/AdminAttendanceReportPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<SplashPage />} />
            
            {/* Login Route - Unified for all roles */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Student Routes */}
            <Route 
              path="/siswa" 
              element={
                <ProtectedRoute allowedRoles={['SISWA']} redirectTo="/login">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/siswa/kelas" 
              element={
                <ProtectedRoute allowedRoles={['SISWA']} redirectTo="/login">
                  <StudentClassPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/siswa/scan" 
              element={
                <ProtectedRoute allowedRoles={['SISWA']} redirectTo="/login">
                  <StudentScanPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/siswa/riwayat" 
              element={
                <ProtectedRoute allowedRoles={['SISWA']} redirectTo="/login">
                  <StudentAttendanceHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/siswa/riwayat/:id" 
              element={
                <ProtectedRoute allowedRoles={['SISWA']} redirectTo="/login">
                  <StudentAttendanceDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/siswa/profil" 
              element={
                <ProtectedRoute allowedRoles={['SISWA']} redirectTo="/login">
                  <StudentProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Teacher Routes */}
            <Route 
              path="/guru" 
              element={
                <ProtectedRoute allowedRoles={['GURU']} redirectTo="/login">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/guru/kelas" 
              element={
                <ProtectedRoute allowedRoles={['GURU']} redirectTo="/login">
                  <TeacherClassroomPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/guru/mata-pelajaran" 
              element={
                <ProtectedRoute allowedRoles={['GURU']} redirectTo="/login">
                  <TeacherSubjectPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/guru/jadwal" 
              element={
                <ProtectedRoute allowedRoles={['GURU']} redirectTo="/login">
                  <TeacherSchedulePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/guru/presensi" 
              element={
                <ProtectedRoute allowedRoles={['GURU']} redirectTo="/login">
                  <TeacherAttendanceSystemPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/guru/riwayat" 
              element={
                <ProtectedRoute allowedRoles={['GURU']} redirectTo="/login">
                  <TeacherHistoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/guru/pengaturan" 
              element={
                <ProtectedRoute allowedRoles={['GURU']} redirectTo="/login">
                  <TeacherSettingsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/login">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="manajemen-pengguna" element={<AdminUserManagementPage />} />
              <Route path="laporan" element={<AdminAttendanceReportPage />} />
              <Route path="pengaturan" element={<AdminSettingsPage />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

