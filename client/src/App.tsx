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
import OnboardingPage from './pages/OnboardingPage'
import CreateTriplistPage from './pages/CreateTriplistPage'
import TriplistPage from './pages/TriplistPage'
import KurumsalPage from './pages/KurumsalPage'
import InfluencerBasvuruPage from './pages/InfluencerBasvuruPage'
import MapPage from './pages/MapPage'
import RehberPage from './pages/RehberPage'
import RehberDetailPage from './pages/RehberDetailPage'

const PlanCreatePage = () => (
  <div style={{ background: '#0D0D0D', minHeight: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗺️</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', marginBottom: '8px' }}>Plan sistemi geliyor</div>
      <div style={{ color: '#666', fontSize: '14px' }}>Yakında aktif olacak</div>
    </div>
  </div>
)

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
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/plan/yeni" element={<ProtectedRoute><CreateTriplistPage /></ProtectedRoute>} />
          <Route path="/plan/:id" element={<ProtectedRoute><PlanCreatePage /></ProtectedRoute>} />
          <Route path="/kurumsal" element={<KurumsalPage />} />
          <Route path="/influencer-basvuru" element={<InfluencerBasvuruPage />} />
          <Route path="/harita" element={<MapPage />} />
          <Route path="/rehber" element={<RehberPage />} />
          <Route path="/rehber/:slug" element={<RehberDetailPage />} />
          <Route path="/:username/triplist/:slug" element={<TriplistPage />} />
          <Route path="/:username/:slug" element={<InvitePage />} />
        </Routes>
        {isMobile && <MobileNav />}
      </BrowserRouter>
    </AuthProvider>
  )
}
