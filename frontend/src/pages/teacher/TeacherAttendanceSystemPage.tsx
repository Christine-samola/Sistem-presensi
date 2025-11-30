import TeacherLayout from '../../layouts/TeacherLayout'
import { QrCode, Clock, Users, Play, Square, Copy, Check, UserPlus, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'react-hot-toast'

interface Sesi {
  id: number
  qr_token: string
  kelas?: number
  jadwal?: number | null
  mata_pelajaran?: number | null
  mata_pelajaran_nama?: string | null
  kelas_nama: string
  waktu_mulai: string
  waktu_selesai: string | null
  status: 'AKTIF' | 'SELESAI'
  jumlah_hadir: number
}

interface MataPelajaran {
  id: number
  nama: string
  kode: string
}

interface SiswaPresensi {
  siswa_id: number
  nama: string
  nim?: string
  email: string
  status: string | null
  waktu_scan: string | null
  sudah_presensi: boolean
}

export default function TeacherAttendanceSystemPage() {
  const [selectedKelas, setSelectedKelas] = useState<number | null>(null)
  const [selectedMataPelajaran, setSelectedMataPelajaran] = useState<number | null>(null)
  const [copiedToken, setCopiedToken] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const queryClient = useQueryClient()

  // Fetch active sesi
  const { data: aktiveSesi, isLoading: loadingSesi, error: errorSesi } = useQuery({
    queryKey: ['active-sesi'],
    queryFn: async () => {
      const response = await api.get('/api/sesi/aktif_sesi/')
      console.log('Active Sesi Response:', response.data)  // Debug log
      return response.data as Sesi | null
    },
    retry: 1,
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  // Debug log
  console.log('aktiveSesi:', aktiveSesi)
  console.log('loadingSesi:', loadingSesi)
  console.log('errorSesi:', errorSesi)

  // Fetch kelas list
  const { data: kelasList } = useQuery({
    queryKey: ['teacher-classes-list'],
    queryFn: async () => {
      const response = await api.get('/api/kelas/')
      return response.data
    },
    retry: 1,
  })

  // Fetch mata pelajaran list
  const { data: mataPelajaranList } = useQuery({
    queryKey: ['mata-pelajaran'],
    queryFn: async () => {
      const response = await api.get('/api/mata-pelajaran/')
      return response.data as MataPelajaran[]
    },
    retry: 1,
  })

  // Start sesi mutation
  const startSesiMutation = useMutation({
    mutationFn: async ({ kelasId, mataPelajaranId }: { kelasId: number; mataPelajaranId?: number | null }) => {
      const payload: any = { kelas: kelasId }
      if (mataPelajaranId) {
        payload.mata_pelajaran = mataPelajaranId
      }
      const response = await api.post('/api/sesi/', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sesi'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-stats'] })
      setSelectedKelas(null)
      setSelectedMataPelajaran(null)
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Gagal memulai sesi')
    },
  })

  // Fetch daftar siswa di sesi aktif
  const { data: daftarSiswa, refetch: refetchDaftarSiswa } = useQuery({
    queryKey: ['daftar-siswa-sesi', aktiveSesi?.id],
    queryFn: async () => {
      if (!aktiveSesi) return []
      const response = await api.get(`/api/sesi/${aktiveSesi.id}/daftar_siswa/`)
      return response.data as SiswaPresensi[]
    },
    enabled: !!aktiveSesi && showManualModal,
    retry: 1,
  })

  // End sesi mutation
  const endSesiMutation = useMutation({
    mutationFn: async (sesiId: number) => {
      const response = await api.patch(`/api/sesi/${sesiId}/selesai/`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sesi'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-history'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-stats'] })
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || 'Gagal mengakhiri sesi')
    },
  })

  // Manual presensi mutation
  const manualPresensiMutation = useMutation({
    mutationFn: async ({ sesiId, siswaId, status }: { sesiId: number; siswaId: number; status: string }) => {
      const response = await api.post(`/api/sesi/${sesiId}/manual_presensi/`, {
        siswa_id: siswaId,
        status: status
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sesi'] })
      queryClient.invalidateQueries({ queryKey: ['daftar-siswa-sesi'] })
      refetchDaftarSiswa()
      toast.success('Presensi berhasil direkam!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Gagal merekam presensi')
    }
  })

  const handleStartSesi = () => {
    if (!selectedKelas) {
      alert('Pilih kelas terlebih dahulu')
      return
    }
    if (window.confirm('Mulai sesi presensi untuk kelas ini?')) {
      startSesiMutation.mutate({ 
        kelasId: selectedKelas, 
        mataPelajaranId: selectedMataPelajaran 
      })
    }
  }

  const handleEndSesi = () => {
    if (aktiveSesi) {
      if (window.confirm('Akhiri sesi presensi? Siswa tidak bisa lagi melakukan absen.')) {
        endSesiMutation.mutate(aktiveSesi.id)
      }
    }
  }

  const handleManualPresensi = (siswaId: number, status: string) => {
    if (!aktiveSesi) return
    
    manualPresensiMutation.mutate({
      sesiId: aktiveSesi.id,
      siswaId: siswaId,
      status: status
    })
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="text-gray-500 text-xs">Belum Presensi</span>
    
    const badges = {
      'HADIR': <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Hadir</span>,
      'TERLAMBAT': <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">Terlambat</span>,
      'IZIN': <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">Izin</span>,
      'SAKIT': <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Sakit</span>,
      'ALPHA': <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">Alpha</span>,
    }
    return badges[status] || <span className="text-gray-500 text-xs">{status}</span>
  }

  // QR Code data - just the token (simpler for manual input)
  const qrCodeData = aktiveSesi?.qr_token || ''
  
  const copyToClipboard = async (text: string, type: 'token' | 'url') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'token') {
        setCopiedToken(true)
        setTimeout(() => setCopiedToken(false), 2000)
      } else {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      }
    } catch (err) {
      alert('Gagal copy ke clipboard')
    }
  }

  return (
    <TeacherLayout currentPage="presensi">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistem Presensi</h1>
          <p className="text-sm text-gray-600">Kelola sesi presensi kelas</p>
        </div>

        {/* Debug Info (temporary) */}
        {errorSesi && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              ⚠️ Error fetching active sesi: {(errorSesi as any)?.message || 'Unknown error'}
            </p>
          </div>
        )}

        {/* Active Session or Start Form */}
        {loadingSesi ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memeriksa sesi aktif...</p>
          </div>
        ) : aktiveSesi && aktiveSesi !== null ? (
          /* Active Session Display */
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-700">Sesi Aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowManualModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Input Manual
                </button>
                <button
                  onClick={handleEndSesi}
                  disabled={endSesiMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <Square className="w-4 h-4" />
                  {endSesiMutation.isPending ? 'Mengakhiri...' : 'Akhiri Sesi'}
                </button>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {aktiveSesi.kelas_nama}
              </h2>
              {aktiveSesi.mata_pelajaran_nama && (
                <p className="text-lg text-blue-600 font-semibold mb-2">
                  📚 {aktiveSesi.mata_pelajaran_nama}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                Dimulai: {new Date(aktiveSesi.waktu_mulai).toLocaleTimeString('id-ID')}
              </div>
            </div>

            {/* QR Code Display */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-6 shadow-inner">
              <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm mx-auto border-4 border-blue-200">
                {/* Real QR Code */}
                <div className="flex items-center justify-center mb-4 bg-white p-4 rounded-xl">
                  <QRCodeSVG 
                    value={qrCodeData}
                    size={240}
                    level="H"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#2563eb"
                  />
                </div>
                
                {/* QR Code Label */}
                <div className="text-center space-y-3">
                  <p className="text-base font-bold text-gray-900">QR Code Presensi</p>
                  
                  {/* Token Display with Copy Button */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 border-2 border-blue-100">
                    <p className="text-xs text-gray-600 mb-2 font-semibold">Token:</p>
                    <p className="text-xs font-mono text-gray-900 break-all mb-3 bg-white px-3 py-2 rounded-lg">
                      {aktiveSesi.qr_token}
                    </p>
                    <button
                      onClick={() => copyToClipboard(aktiveSesi.qr_token, 'token')}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        copiedToken
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {copiedToken ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Token
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="mt-6 space-y-3">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800 mb-2">
                    📱 Panduan untuk Siswa
                  </p>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-blue-100">
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        1
                      </div>
                      <p className="text-sm text-gray-700 flex-1">
                        Buka menu <span className="font-bold text-blue-600">Presensi</span> di aplikasi siswa
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        2
                      </div>
                      <p className="text-sm text-gray-700 flex-1">
                        <span className="font-bold">Scan QR code</span> ini dengan kamera HP
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        3
                      </div>
                      <p className="text-sm text-gray-700 flex-1">
                        Atau <span className="font-bold">copy-paste token</span> di atas ke kolom input manual
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
                  <p className="text-xs text-yellow-800">
                    ⏰ <span className="font-bold">Penting:</span> QR code ini berlaku selama 1 jam dari waktu mulai sesi.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Siswa Hadir</p>
                <p className="text-3xl font-bold text-gray-900">{aktiveSesi.jumlah_hadir || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Durasi</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.floor((Date.now() - new Date(aktiveSesi.waktu_mulai).getTime()) / 60000)} min
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Start Session Form */
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {/* Debug Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
              <p className="text-gray-600">
                Debug: aktiveSesi = {aktiveSesi === null ? 'null' : aktiveSesi === undefined ? 'undefined' : 'exists'}
              </p>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Mulai Sesi Presensi
              </h2>
              <p className="text-sm text-gray-600">
                Pilih kelas untuk memulai sesi presensi
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedKelas || ''}
                  onChange={(e) => setSelectedKelas(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {(kelasList || []).map((kelas: any) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama} - Kelas {kelas.tingkat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mata Pelajaran <span className="text-gray-500 text-xs">(Opsional)</span>
                </label>
                <select
                  value={selectedMataPelajaran || ''}
                  onChange={(e) => setSelectedMataPelajaran(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  <option value="">-- Pilih Mata Pelajaran (Opsional) --</option>
                  {(mataPelajaranList || []).map((mapel: MataPelajaran) => (
                    <option key={mapel.id} value={mapel.id}>
                      {mapel.nama} ({mapel.kode})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pilih mata pelajaran untuk sesi ini (opsional)
                </p>
              </div>

              <button
                onClick={handleStartSesi}
                disabled={!selectedKelas || startSesiMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {startSesiMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memulai...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Mulai Sesi
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tips:</strong> Pastikan semua siswa siap sebelum memulai sesi. 
            QR code akan ditampilkan setelah sesi dimulai dan berlaku selama 1 jam.
          </p>
        </div>

        {/* Manual Presensi Modal */}
        {showManualModal && aktiveSesi && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowManualModal(false)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Input Presensi Manual</h2>
                  <p className="text-white/80 text-sm">{aktiveSesi.kelas_nama}</p>
                </div>
                <button 
                  onClick={() => setShowManualModal(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                {/* Stats Summary */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{daftarSiswa?.length || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">Hadir</p>
                    <p className="text-2xl font-bold text-green-700">
                      {daftarSiswa?.filter(s => s.status === 'HADIR' || s.status === 'TERLAMBAT').length || 0}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">Izin/Sakit</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {daftarSiswa?.filter(s => s.status === 'IZIN' || s.status === 'SAKIT').length || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600">Alpha</p>
                    <p className="text-2xl font-bold text-red-700">
                      {daftarSiswa?.filter(s => s.status === 'ALPHA').length || 0}
                    </p>
                  </div>
                </div>

                {/* Student List */}
                <div className="space-y-2">
                  {!daftarSiswa ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Memuat daftar siswa...</p>
                    </div>
                  ) : daftarSiswa.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Tidak ada siswa di kelas ini</p>
                    </div>
                  ) : (
                    daftarSiswa.map((siswa) => (
                      <div key={siswa.siswa_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              siswa.sudah_presensi ? 'bg-green-500' : 'bg-gray-400'
                            }`}>
                              {siswa.sudah_presensi ? (
                                <CheckCircle className="w-6 h-6" />
                              ) : (
                                siswa.nama.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{siswa.nama}</p>
                              <p className="text-xs text-gray-600">{siswa.nim || siswa.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {siswa.sudah_presensi ? (
                              <>
                                <div className="mr-2">
                                  {getStatusBadge(siswa.status)}
                                </div>
                                <button
                                  onClick={() => handleManualPresensi(siswa.siswa_id, 'HADIR')}
                                  disabled={manualPresensiMutation.isPending}
                                  className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded transition-colors disabled:opacity-50"
                                  title="Hadir"
                                >
                                  Hadir
                                </button>
                                <button
                                  onClick={() => handleManualPresensi(siswa.siswa_id, 'IZIN')}
                                  disabled={manualPresensiMutation.isPending}
                                  className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-medium rounded transition-colors disabled:opacity-50"
                                  title="Izin"
                                >
                                  Izin
                                </button>
                                <button
                                  onClick={() => handleManualPresensi(siswa.siswa_id, 'SAKIT')}
                                  disabled={manualPresensiMutation.isPending}
                                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded transition-colors disabled:opacity-50"
                                  title="Sakit"
                                >
                                  Sakit
                                </button>
                                <button
                                  onClick={() => handleManualPresensi(siswa.siswa_id, 'ALPHA')}
                                  disabled={manualPresensiMutation.isPending}
                                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded transition-colors disabled:opacity-50"
                                  title="Alpha"
                                >
                                  Alpha
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleManualPresensi(siswa.siswa_id, 'HADIR')}
                                  disabled={manualPresensiMutation.isPending}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                                  title="Hadir"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleManualPresensi(siswa.siswa_id, 'IZIN')}
                                  disabled={manualPresensiMutation.isPending}
                                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                                  title="Izin"
                                >
                                  I
                                </button>
                                <button
                                  onClick={() => handleManualPresensi(siswa.siswa_id, 'SAKIT')}
                                  disabled={manualPresensiMutation.isPending}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                                  title="Sakit"
                                >
                                  S
                                </button>
                                <button
                                  onClick={() => handleManualPresensi(siswa.siswa_id, 'ALPHA')}
                                  disabled={manualPresensiMutation.isPending}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                                  title="Alpha"
                                >
                                  A
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{daftarSiswa?.filter(s => s.sudah_presensi).length || 0}</span> dari <span className="font-semibold">{daftarSiswa?.length || 0}</span> siswa sudah presensi
                </p>
                <button 
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
