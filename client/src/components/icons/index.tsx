import React from 'react'

const base = {
  fill: 'none' as const,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

// ── NAV İKONLARI ──────────────────────────────

export const HomeIcon = ({ active = false }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base}
       stroke={active ? '#00F680' : '#555'} strokeWidth="1.8">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

export const MapPinIcon = ({ active = false }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base}
       stroke={active ? '#00F680' : '#555'} strokeWidth="1.8">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
)

export const UsersIcon = ({ active = false }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base}
       stroke={active ? '#00F680' : '#555'} strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

export const UserIcon = ({ active = false }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base}
       stroke={active ? '#00F680' : '#555'} strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

export const LogInIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base}
       stroke="#555" strokeWidth="1.8">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
)

export const PlusIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" {...base}
       stroke="#0D0D0D" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

// ── FEATURE İKONLARI (yeşil) ──────────────────

export const PlanIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base}
       stroke="#00F680" strokeWidth="1.8">
    <rect x="3" y="4" width="4" height="4" rx="1"/>
    <rect x="3" y="10" width="4" height="4" rx="1"/>
    <rect x="3" y="16" width="4" height="4" rx="1"/>
    <line x1="10" y1="6" x2="21" y2="6"/>
    <line x1="10" y1="12" x2="21" y2="12"/>
    <line x1="10" y1="18" x2="21" y2="18"/>
  </svg>
)

export const ShareIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base}
       stroke="#00F680" strokeWidth="1.8">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="#00F680" fillOpacity="0.15"/>
  </svg>
)

export const PinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base}
       stroke="#00F680" strokeWidth="1.8">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
)

export const RouteIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base}
       stroke="#00F680" strokeWidth="1.8">
    <path d="M3 17 C6 17 6 7 12 7 S18 17 21 17"/>
    <circle cx="3" cy="17" r="2" fill="#00F680" stroke="none"/>
    <circle cx="12" cy="7" r="2" fill="#00F680" stroke="none"/>
    <circle cx="21" cy="17" r="2" fill="#00F680" stroke="none"/>
  </svg>
)

export const JoinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base}
       stroke="#00F680" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

export const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base}
       stroke="#00F680" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

export const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...base}
       stroke="#00F680" strokeWidth="1.8"
       fill={filled ? '#00F680' : 'none'}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
)

// ── GNO İKONLARI (pembe) ──────────────────────

export const GnoGroupIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...base}
       stroke="#FF6FAE" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

export const GnoLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...base}
       stroke="#FF6FAE" strokeWidth="1.8">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

export const GnoVoteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...base}
       stroke="#FF6FAE" strokeWidth="1.8">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export const GnoTrophyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...base}
       stroke="#FF6FAE" strokeWidth="1.8">
    <polyline points="8 21 12 17 16 21"/>
    <line x1="12" y1="17" x2="12" y2="13"/>
    <path d="M7 4H4a2 2 0 0 0-2 2v2a6 6 0 0 0 6 6"/>
    <path d="M17 4h3a2 2 0 0 1 2 2v2a6 6 0 0 1-6 6"/>
    <rect x="7" y="2" width="10" height="11" rx="1"/>
  </svg>
)
