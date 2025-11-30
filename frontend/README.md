# SLADOR - School Attendance System Frontend

A modern, mobile-first school attendance system built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- 🎯 **Mobile-First Responsive Design** - Optimized for mobile devices (398-415px width)
- 📱 **QR Code Scanning** - Real-time QR code scanning for attendance
- 🔐 **Authentication** - Login and role-based access
- 📊 **Attendance Tracking** - View attendance history with detailed statistics
- 👤 **Profile Management** - Edit profile and change password
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS
- ⚡ **Fast Performance** - Powered by Vite for lightning-fast development

## Tech Stack

- **React 18** - Latest React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router 6** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Modern icon library

## Project Structure

```
src/
├── layouts/
│   └── StudentLayout.tsx       # Student layout with sidebar navigation
├── pages/
│   ├── SplashPage.tsx           # Welcome page with role selection (Murid/Guru/Admin)
│   ├── auth/
│   │   └── LoginPage.tsx       # Login form
│   └── student/
│       ├── StudentDashboard.tsx        # Student dashboard
│       ├── StudentScanPage.tsx          # QR code scanning page
│       ├── StudentAttendanceHistory.tsx # Attendance history list
│       ├── StudentAttendanceDetail.tsx  # Attendance detail page
│       └── StudentProfilePage.tsx       # Profile & settings page
├── App.tsx                      # Main app component with routes
├── main.tsx                     # Entry point
└── index.css                    # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Available Routes

### Public Routes
- `/` - Welcome page with role selection (MURID, GURU, ADMIN)
- `/login` - Login page

### Student Routes
- `/siswa` - Student dashboard
- `/siswa/scan` - QR code scanning for attendance
- `/siswa/riwayat` - Attendance history list
- `/siswa/riwayat/:id` - Attendance detail page
- `/siswa/profil` - Profile and settings page

## Features Implementation

### QR Code Scanning
- Uses `getUserMedia` API for camera access
- Support for front/back camera switching
- Fallback to manual code input
- Integration ready for BarcodeDetector API or jsQR library

### State Management
- TanStack Query for server state and caching
- Local state with React hooks
- Form state with React Hook Form
- Ready for Zustand/Redux integration

### Form Validation
- Schema-driven validation with Zod
- Real-time error feedback
- Client-side and ready for server-side validation

## Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Development Notes

- All text is in English (as per user preference)
- UI components follow the mobile-first approach
- Responsive breakpoints: mobile (398-415px) scales to larger viewports
- Camera permissions required for QR scanning functionality
- Mock data is used for demonstration purposes

## Future Enhancements

- [ ] API integration for real data
- [ ] Authentication state management
- [ ] Teacher and Admin interfaces
- [ ] i18n support (English/Indonesian)
- [ ] Offline support with service workers
- [ ] Push notifications
- [ ] Advanced analytics and reporting

## License

MIT License

