import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import CookieBanner from './components/CookieBanner'
import MobileNav from './components/MobileNav'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CreateCardPage from './pages/CreateCardPage'
import CreateGNOPage from './pages/CreateGNOPage'
import InvitePage from './pages/InvitePage'
import GNOPage from './pages/GNOPage'
import LandingPage from './pages/LandingPage'
import KVKKPage from './pages/KVKKPage'
import AdminPage from './pages/AdminPage'
import CommunityPage from './pages/CommunityPage'
import VenuesPage from './pages/VenuesPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <CookieBanner />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/kvkk" element={<KVKKPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateCardPage /></ProtectedRoute>} />
          <Route path="/create-gno" element={<ProtectedRoute><CreateGNOPage /></ProtectedRoute>} />
          <Route path="/girlsnightout/:slug" element={<GNOPage />} />
          <Route path="/topluluk" element={<CommunityPage />} />
          <Route path="/bulusma-mekanlari" element={<VenuesPage />} />
          <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/:username/:slug" element={<InvitePage />} />
        </Routes>
        {isMobile && <MobileNav />}
      </BrowserRouter>
    </AuthProvider>
  )
}
