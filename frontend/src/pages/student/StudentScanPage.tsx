import StudentLayout from '../../layouts/StudentLayout'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Video, Camera, ArrowLeft, CheckCircle2, XCircle, AlertCircle, Loader2, Users } from 'lucide-react'
import api from '@/lib/api'
import { Link } from 'react-router-dom'
import jsQR from 'jsqr'

export default function StudentScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [tokenManual, setTokenManual] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ 
    type: 'success' | 'error' | 'info' | null, 
    message: string 
  }>({ type: null, message: '' })
  const [presensiSuccess, setPresensiSuccess] = useState<{
    status: string
    kelas_nama?: string
    guru_nama?: string
    waktu_scan: string
    tanggal?: string
    jam_mulai?: string
    jam_selesai?: string
    sesi_id?: number
    already_scanned?: boolean
  } | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningIntervalRef = useRef<number | null>(null)
  const [qrDetected, setQrDetected] = useState(false)

  useEffect(() => {
    return () => {
      // Cleanup stream and interval on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (scanningIntervalRef.current) {
        clearInterval(scanningIntervalRef.current)
      }
    }
  }, [])

  const submitToken = async (token: string) => {
    if (!token.trim()) {
      setResult({ type: 'error', message: 'Token tidak valid' })
      return
    }
    
    setSubmitting(true)
    setScanning(false)
    
    // Stop scanning temporarily
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current)
      scanningIntervalRef.current = null
    }
    
    try {
      const res = await api.post('/api/scan', { token: token.trim() })
      
      // Success! Set persistent success data
      setPresensiSuccess({
        status: res.data.status,
        kelas_nama: res.data.kelas_nama,
        guru_nama: res.data.guru_nama,
        waktu_scan: res.data.waktu_scan || new Date().toISOString(),
        tanggal: res.data.tanggal,
        jam_mulai: res.data.jam_mulai,
        jam_selesai: res.data.jam_selesai,
        sesi_id: res.data.sesi,
        already_scanned: res.data.already_scanned || false
      })
      
      // Clear error/info messages
      setResult({ type: null, message: '' })
      
      // Stop camera after success
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        setPermissionGranted(false)
      }
      
      // Clear token input
      setTokenManual('')
      
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Gagal mencatat presensi'
      setResult({ type: 'error', message: msg })
      
      // Resume scanning after error
      if (permissionGranted) {
        startContinuousScanning()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || submitting) return

    const video = videoRef.current
    const canvas = canvasRef.current
    
    // Check if video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return
    }

    const width = video.videoWidth
    const height = video.videoHeight
    
    if (width === 0 || height === 0) return

    canvas.width = width
    canvas.height = height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)
    
    // Detect QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (code && code.data) {
      console.log('QR Code detected:', code.data)
      setQrDetected(true)
      setTokenManual(code.data)
      
      // Auto-submit the detected token
      submitToken(code.data)
    } else {
      setQrDetected(false)
    }
  }, [submitting])

  const startContinuousScanning = useCallback(() => {
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current)
    }
    
    setScanning(true)
    // Scan every 300ms (3-4 times per second)
    scanningIntervalRef.current = window.setInterval(() => {
      scanFrame()
    }, 300)
  }, [scanFrame])

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      console.log('Camera access granted')
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play()
            console.log('Video playing, starting auto-scan...')
            setPermissionGranted(true)
            setResult({ type: 'success', message: 'Kamera aktif! Arahkan ke QR code untuk auto-scan.' })
            
            // Start continuous scanning
            setTimeout(() => {
              startContinuousScanning()
              setResult({ type: 'info', message: '🔍 Scanning... Arahkan kamera ke QR code' })
            }, 500)
          } catch (playError) {
            console.error('Error playing video:', playError)
            setPermissionGranted(true)
          }
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setResult({ 
        type: 'error', 
        message: 'Mohon izinkan akses kamera untuk menggunakan fitur scanning' 
      })
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current)
      scanningIntervalRef.current = null
    }
    setPermissionGranted(false)
    setScanning(false)
  }

  const toggleCamera = async () => {
    stopCamera()
    const newMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newMode)
    
    setTimeout(async () => {
      await startCamera()
    }, 200)
  }

  const handleManualSubmit = () => {
    submitToken(tokenManual)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitting) {
      handleManualSubmit()
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'HADIR') return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' }
    if (status === 'TERLAMBAT') return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-600' }
    if (status === 'SAKIT') return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-600' }
    return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' }
  }

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Presensi
            </h1>
            <p className="text-sm text-gray-600">Scan QR code untuk mencatat kehadiran</p>
          </div>
          <Link 
            to="/siswa"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* SUCCESS SECTION - Persistent Detail Absensi */}
        {presensiSuccess && (
          <div className={`rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top ${
            presensiSuccess.already_scanned
              ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-4 border-blue-300'
              : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-4 border-green-300'
          }`}>
            {/* Success Header */}
            <div className={`px-6 py-5 flex items-center justify-between ${
              presensiSuccess.already_scanned
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                : 'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  {presensiSuccess.already_scanned ? (
                    <AlertCircle className="w-7 h-7 text-blue-600" />
                  ) : (
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {presensiSuccess.already_scanned ? 'Anda Sudah Absen' : 'Presensi Berhasil!'}
                  </h2>
                  <p className={`text-sm ${
                    presensiSuccess.already_scanned ? 'text-blue-100' : 'text-green-100'
                  }`}>
                    {presensiSuccess.already_scanned 
                      ? 'Anda sudah melakukan presensi sebelumnya' 
                      : 'Kehadiran Anda telah tercatat'}
                  </p>
                </div>
              </div>
            </div>

            {/* Detail Absensi */}
            <div className="p-6 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-center">
                <div className={`px-6 py-3 rounded-2xl font-bold text-lg border-2 ${
                  getStatusColor(presensiSuccess.status).bg
                } ${
                  getStatusColor(presensiSuccess.status).border
                } ${
                  getStatusColor(presensiSuccess.status).text
                } shadow-lg`}>
                  ✓ {presensiSuccess.status}
                </div>
              </div>

              {/* Warning Banner for Already Scanned */}
              {presensiSuccess.already_scanned && (
                <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-bold text-blue-800">
                      ℹ️ Anda sudah melakukan scan sebelumnya untuk sesi ini
                    </p>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Data di bawah ini adalah detail presensi Anda yang sudah tersimpan.
                  </p>
                </div>
              )}

              {/* Detail Info */}
              <div className={`bg-white rounded-xl p-5 shadow-md border-2 space-y-3 ${
                presensiSuccess.already_scanned ? 'border-blue-100' : 'border-green-100'
              }`}>
                {/* Kelas Info */}
                {presensiSuccess.kelas_nama && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <span className="text-sm font-semibold text-gray-700">Kelas</span>
                    <span className="text-sm font-bold text-gray-900">
                      {presensiSuccess.kelas_nama}
                    </span>
                  </div>
                )}

                {/* Guru Info */}
                {presensiSuccess.guru_nama && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Guru</span>
                    <span className="text-sm font-bold text-gray-900">
                      {presensiSuccess.guru_nama}
                    </span>
                  </div>
                )}

                {/* Jadwal */}
                {presensiSuccess.jam_mulai && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Jadwal</span>
                    <span className="text-sm font-bold text-gray-900">
                      {presensiSuccess.jam_mulai} - {presensiSuccess.jam_selesai}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">Waktu Absen</span>
                  <span className="text-sm font-bold text-gray-900">
                    {new Date(presensiSuccess.waktu_scan).toLocaleTimeString('id-ID', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">Tanggal</span>
                  <span className="text-sm font-bold text-gray-900">
                    {presensiSuccess.tanggal ? new Date(presensiSuccess.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : new Date(presensiSuccess.waktu_scan).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">ID Sesi</span>
                  <span className="text-sm font-mono font-bold text-gray-900">
                    #{presensiSuccess.sesi_id}
                  </span>
                </div>
              </div>

              {/* Success Animation */}
              <div className="relative py-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-32 h-32 rounded-full animate-ping ${
                    presensiSuccess.already_scanned ? 'bg-blue-400/20' : 'bg-green-400/20'
                  }`}></div>
                </div>
                <div className="relative flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ${
                    presensiSuccess.already_scanned 
                      ? 'bg-gradient-to-br from-blue-400 to-indigo-500' 
                      : 'bg-gradient-to-br from-green-400 to-emerald-500'
                  }`}>
                    {presensiSuccess.already_scanned ? (
                      <AlertCircle className="w-16 h-16 text-white" />
                    ) : (
                      <CheckCircle2 className="w-16 h-16 text-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/siswa/riwayat"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
                >
                  <Users className="w-4 h-4" />
                  Lihat Riwayat
                </Link>
                <Link
                  to="/siswa"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Link>
              </div>

              {/* Info Note */}
              <div className={`border-2 rounded-xl p-3 mt-4 ${
                presensiSuccess.already_scanned
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-xs text-center ${
                  presensiSuccess.already_scanned ? 'text-yellow-800' : 'text-blue-800'
                }`}>
                  {presensiSuccess.already_scanned ? (
                    <>
                      ⚠️ <span className="font-bold">Perhatian:</span> Presensi untuk sesi ini sudah tercatat sebelumnya. Data di atas adalah presensi Anda yang pertama kali.
                    </>
                  ) : (
                    <>
                      💡 <span className="font-bold">Tips:</span> Data presensi Anda sudah tersimpan dan dapat dilihat di menu Riwayat
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Result Message - Only show if not success (success has its own section) */}
        {result.type && !presensiSuccess && (
          <div className={`
            rounded-xl p-4 border-2 shadow-lg animate-in slide-in-from-top duration-300
            ${result.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : result.type === 'error' 
              ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200'
            }
          `}>
            <div className="flex items-center gap-3">
              {result.type === 'success' ? (
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              ) : result.type === 'error' ? (
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1">
                <p className={`
                  font-semibold text-sm
                  ${result.type === 'success' 
                    ? 'text-green-800' 
                    : result.type === 'error' 
                    ? 'text-red-800'
                    : 'text-blue-800'
                  }
                `}>
                  {result.type === 'success' ? 'Berhasil!' : result.type === 'error' ? 'Gagal' : 'Info'}
                </p>
                <p className={`
                  text-sm mt-0.5
                  ${result.type === 'success' 
                    ? 'text-green-700' 
                    : result.type === 'error' 
                    ? 'text-red-700'
                    : 'text-blue-700'
                  }
                `}>
                  {result.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Camera Permission Banner */}
        {!permissionGranted && !result.type && !presensiSuccess && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Akses Kamera Diperlukan</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Klik tombol "Aktifkan Kamera" untuk mulai auto-scanning
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scanning Status */}
        {permissionGranted && scanning && !submitting && !presensiSuccess && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {qrDetected ? '🎯 QR Code Terdeteksi!' : '🔍 Auto-Scanning Aktif'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {qrDetected ? 'Memproses...' : 'Arahkan kamera ke QR code'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Camera View Card - Hide when success */}
        {!presensiSuccess && (
        <div className="bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-white" />
              <h2 className="text-base font-bold text-white">QR Scanner</h2>
            </div>
            {permissionGranted && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-white/90 font-medium">Auto-Scan Aktif</span>
              </div>
            )}
          </div>
          
          <div className="p-5 space-y-4">
            {/* Camera Container */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-300 shadow-lg">
              <div className="aspect-square relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${permissionGranted ? 'block' : 'hidden'}`}
                />
                
                {permissionGranted && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                      <div className={`w-56 h-56 border-2 rounded-2xl transition-colors duration-300 ${
                        qrDetected ? 'border-green-400' : 'border-white/30'
                      }`}>
                        {/* Corner Guides - Change color when QR detected */}
                        <div className={`absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 rounded-tl-xl transition-colors ${
                          qrDetected ? 'border-green-400' : 'border-green-400/70'
                        }`}></div>
                        <div className={`absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 rounded-tr-xl transition-colors ${
                          qrDetected ? 'border-green-400' : 'border-green-400/70'
                        }`}></div>
                        <div className={`absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 rounded-bl-xl transition-colors ${
                          qrDetected ? 'border-green-400' : 'border-green-400/70'
                        }`}></div>
                        <div className={`absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 rounded-br-xl transition-colors ${
                          qrDetected ? 'border-green-400' : 'border-green-400/70'
                        }`}></div>
                        
                        {/* Scanning Line Animation */}
                        <div className="absolute inset-0 overflow-hidden rounded-2xl">
                          <div className={`h-1 w-full bg-gradient-to-r from-transparent to-transparent animate-scan-line ${
                            qrDetected ? 'via-green-400' : 'via-blue-400'
                          }`}></div>
                        </div>
                      </div>
                      <p className="text-center text-white text-xs mt-3 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                        {qrDetected ? '✓ QR Code Terdeteksi!' : 'Posisikan QR code di dalam frame'}
                      </p>
                    </div>
                  </div>
                )}
                
                {!permissionGranted && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 shadow-xl">
                      <Video className="w-10 h-10 text-white/60" />
                    </div>
                    <p className="text-white/80 text-sm font-medium">Camera tidak aktif</p>
                    <p className="text-white/60 text-xs mt-1">Klik tombol di bawah untuk mengaktifkan</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Hidden canvas for QR processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Controls */}
            <div className="flex items-center justify-between gap-3">
              {!permissionGranted ? (
                <button
                  onClick={startCamera}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3.5 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm hover:scale-105 transform"
                >
                  <Camera className="w-5 h-5" />
                  Aktifkan Kamera & Auto-Scan
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleCamera}
                    className="bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 font-semibold transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {facingMode === 'environment' ? 'Depan' : 'Belakang'}
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <XCircle className="w-5 h-5" />
                    Matikan Kamera
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
        )}

        {/* Info Card - Hide when success */}
        {!presensiSuccess && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 rounded-xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">💡 Cara Menggunakan Auto-Scan</h3>
              <ul className="text-xs text-gray-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Klik "Aktifkan Kamera & Auto-Scan"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">2.</span>
                  <span><strong>Arahkan kamera</strong> ke QR code yang ditampilkan guru</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">3.</span>
                  <span><strong>Tunggu beberapa detik</strong> - QR akan terdeteksi dan presensi otomatis tercatat!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Tidak perlu tekan tombol scan, sistem akan <strong>otomatis detect</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        )}

        {/* Success Animation Styles */}
        <style>{`
          @keyframes scan-line {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(224px);
            }
          }
          .animate-scan-line {
            animation: scan-line 2s ease-in-out infinite;
          }
          @keyframes slide-in-from-top {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-in {
            animation-fill-mode: both;
          }
          .slide-in-from-top {
            animation-name: slide-in-from-top;
          }
        `}</style>
      </div>
    </StudentLayout>
  )
}
