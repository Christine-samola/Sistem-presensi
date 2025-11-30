import { useState } from 'react'
import { Calendar, Download, Filter, TrendingUp, TrendingDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import api from '@/lib/api'

export default function AdminAttendanceReportPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [classFilter, setClassFilter] = useState('ALL')

  // Fetch kelas list
  const { data: kelasList } = useQuery({
    queryKey: ['admin-kelas-list'],
    queryFn: async () => {
      const response = await api.get('/api/kelas/')
      return response.data
    },
    retry: false,
  })

  // Fetch attendance report data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['admin-attendance-report', startDate, endDate, classFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (classFilter !== 'ALL') params.append('class', classFilter)
      
      const response = await api.get(`/api/admin/attendance/report?${params.toString()}`)
      return response.data as {
        totalPresent: number
        totalPermit: number
        totalSick: number
        totalAbsent: number
        classRates: Array<{ class: string; rate: number; color: string }>
        studentDetails: Array<{
          name: string
          class: string
          hadir: number
          izin: number
          sakit: number
          alpha: number
          percentage: number
        }>
      }
    },
    retry: false,
  })

  const handleExportReport = () => {
    if (!reportData) {
      alert('Data laporan belum tersedia')
      return
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const printDate = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    const startLabel = startDate || '-'
    const endLabel = endDate || '-'
    const classLabel = classFilter === 'ALL' ? 'Semua Kelas' : classFilter

    doc.setFontSize(16)
    doc.text('Laporan Kehadiran Siswa', 14, 20)
    doc.setFontSize(11)
    doc.text(`Tanggal Cetak: ${printDate}`, 14, 28)
    doc.text(`Rentang Tanggal: ${startLabel} s/d ${endLabel}`, 14, 34)
    doc.text(`Filter Kelas: ${classLabel}`, 14, 40)

    autoTable(doc, {
      startY: 48,
      head: [['Kategori', 'Jumlah']],
      body: [
        ['Total Kehadiran', (reportData.totalPresent ?? 0).toString()],
        ['Total Izin', (reportData.totalPermit ?? 0).toString()],
        ['Total Sakit', (reportData.totalSick ?? 0).toString()],
        ['Total Alpa', (reportData.totalAbsent ?? 0).toString()],
      ],
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
      },
    })

    const summaryTableY =
      (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 48

    if (reportData.studentDetails && reportData.studentDetails.length > 0) {
      autoTable(doc, {
        startY: summaryTableY + 10,
        head: [['Nama', 'Kelas', 'Hadir', 'Izin', 'Sakit', 'Alpa', 'Persentase']],
        body: reportData.studentDetails.map((student) => [
          student.name,
          student.class,
          student.hadir.toString(),
          student.izin.toString(),
          student.sakit.toString(),
          student.alpha.toString(),
          `${student.percentage}%`,
        ]),
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: [31, 41, 55],
          textColor: [255, 255, 255],
        },
      })
    } else {
      doc.setFontSize(11)
      doc.text('Tidak ada detail kehadiran siswa untuk ditampilkan.', 14, summaryTableY + 16)
    }

    const filenameParts = [
      'laporan-kehadiran',
      startDate || 'all',
      endDate || 'all',
      classFilter.toLowerCase(),
    ]
    const sanitizedName = filenameParts
      .filter(Boolean)
      .join('-')
      .replace(/[^a-z0-9-]/gi, '_')
    doc.save(`${sanitizedName}.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Kehadiran</h1>
          <p className="text-gray-600 mt-2">Analisis dan laporan kehadiran siswa</p>
        </div>
        <button 
          onClick={handleExportReport}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <Download className="w-5 h-5" />
          Export Laporan
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Laporan</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kelas
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">Semua Kelas</option>
              {kelasList && kelasList.map((kelas: any) => (
                <option key={kelas.id} value={kelas.nama}>
                  {kelas.nama} ({kelas.tingkat})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Kehadiran</p>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {reportData?.totalPresent || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Izin</p>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {reportData?.totalPermit || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Sakit</p>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {reportData?.totalSick || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Alpa</p>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {reportData?.totalAbsent || 0}
          </p>
        </div>
      </div>

      {/* Attendance Rate */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Tingkat Kehadiran per Kelas</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Memuat data...</p>
          </div>
        ) : !reportData?.classRates || reportData.classRates.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Belum ada data kehadiran</p>
            <p className="text-xs text-gray-500 mt-1">Mulai sesi presensi untuk melihat laporan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reportData.classRates.map((item) => (
              <div key={item.class}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{item.class}</span>
                  <span className="text-gray-700 font-medium">{item.rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${item.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${item.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detail Kehadiran Siswa</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama Siswa</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kelas</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Hadir</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Izin</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Sakit</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Alpa</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : !reportData?.studentDetails || reportData.studentDetails.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Belum ada data kehadiran siswa
                  </td>
                </tr>
              ) : (
                reportData.studentDetails.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-gray-700">{student.class}</td>
                    <td className="px-6 py-4 text-center text-green-600 font-semibold">{student.hadir}</td>
                    <td className="px-6 py-4 text-center text-yellow-600 font-semibold">{student.izin}</td>
                    <td className="px-6 py-4 text-center text-blue-600 font-semibold">{student.sakit}</td>
                    <td className="px-6 py-4 text-center text-red-600 font-semibold">{student.alpha}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        student.percentage >= 90 
                          ? 'bg-green-100 text-green-700'
                          : student.percentage >= 75
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {student.percentage}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

