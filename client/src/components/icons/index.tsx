export const RouteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke="#00F680" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12 C6 8, 10 16, 14 10, 18 14, 21 12"/>
    <circle cx="3" cy="12" r="2" fill="#00F680" stroke="none"/>
    <circle cx="12" cy="11" r="2" fill="#00F680" stroke="none"/>
    <circle cx="21" cy="12" r="2" fill="#00F680" stroke="none"/>
  </svg>
)

export const PinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke="#00F680" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s-8-6.5-8-13a8 8 0 1 1 16 0c0 6.5-8 13-8 13z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
)

export const PlanIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke="#00F680" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="4" height="4" rx="1"/>
    <rect x="3" y="11" width="4" height="4" rx="1"/>
    <rect x="3" y="17" width="4" height="4" rx="1"/>
    <line x1="10" y1="7" x2="21" y2="7"/>
    <line x1="10" y1="13" x2="21" y2="13"/>
    <line x1="10" y1="19" x2="21" y2="19"/>
  </svg>
)

export const ShareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke="#00F680" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

export const JoinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke="#00F680" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

export const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24"
       fill={filled ? "#00F680" : "none"}
       stroke="#00F680" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
)

export const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke="#00F680" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

export const HomeIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke={active ? "#00F680" : "#555"} strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

export const MapPinIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke={active ? "#00F680" : "#555"} strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

export const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke="#0D0D0D" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

export const UsersIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke={active ? "#00F680" : "#555"} strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

export const UserIcon = ({ active = false }: { active?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke={active ? "#00F680" : "#555"} strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

export const LogInIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
)
