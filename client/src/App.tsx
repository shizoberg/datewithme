import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import CookieBanner from './components/CookieBanner'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CreateCardPage from './pages/CreateCardPage'
import CreateGNOPage from './pages/CreateGNOPage'
import InvitePage from './pages/InvitePage'
import GNOPage from './pages/GNOPage'
import LandingPage from './pages/LandingPage'
import KVKKPage from './pages/KVKKPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CookieBanner />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/kvkk" element={<KVKKPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateCardPage /></ProtectedRoute>} />
          <Route path="/create-gno" element={<ProtectedRoute><CreateGNOPage /></ProtectedRoute>} />
          <Route path="/girlsnightout/:slug" element={<GNOPage />} />
          <Route path="/:username/:slug" element={<InvitePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
