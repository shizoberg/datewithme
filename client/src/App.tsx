import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CreateCardPage from './pages/CreateCardPage'
import InvitePage from './pages/InvitePage'
import LandingPage from './pages/LandingPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateCardPage /></ProtectedRoute>} />
          <Route path="/:username/:slug" element={<InvitePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
