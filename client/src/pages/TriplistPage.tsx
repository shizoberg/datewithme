import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { AvatarDisplay } from '../components/avatars'

interface Stop {
  id: string; order: number; venueName: string; venueId?: string
  address?: string; description?: string
  transitMode?: string; transitLine?: string; transitNote?: string
}

interface Triplist {
  id: string; title: string; slug: string
  country: string; city: string; district?: string; description?: string
  isPublic: boolean; startDate?: string; endDate?: string
  teamMembers?: string; viewCount: number
  user: { username: string; name: string; avatarId?: string }
  stops: Stop[]
}

const TRANSIT_MODE_ICONS: Record<string, React.ReactElement> = {
  'yürüyüş': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/><path d="M7.5 17.5L9 13l3 2 2-4"/><path d="M11 13l-2 4.5"/></svg>,
  'otobüs': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M2 9h20M9 4v5M15 4v5"/><circle cx="7" cy="19" r="1"/><circle cx="17" cy="19" r="1"/></svg>,
  'metro': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="16" rx="2"/><path d="M4 10h16M9 2v8M15 2v8"/><circle cx="9" cy="20" r="1"/><circle cx="15" cy="20" r="1"/><path d="M9 18v2M15 18v2"/></svg>,
  'tramvay': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="14" rx="2"/><path d="M4 9h16"/><circle cx="9" cy="21" r="1"/><circle cx="15" cy="21" r="1"/><path d="M12 2v2"/></svg>,
  'taksi': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  'araba': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  'feribot': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2M3 12h18l-1.5-6H4.5L3 12z"/><path d="M12 12V6"/><path d="M12 6l-4 3M12 6l4 3"/></svg>,
}

function CalendarBlock({ dateStr, label }: { dateStr: string; label?: string }) {
  const d = new Date(dateStr)
  const day = d.toLocaleDateString('tr-TR', { weekday: 'short' }).toUpperCase()
  const num = d.getDate()
  const month = d.toLocaleDateString('tr-TR', { month: 'long' })
  const year = d.getFullYear()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '72px' }}>
      {label && <div style={{ fontSize: '10px', fontWeight: 700, color: '#999', letterSpacing: '0.5px', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</div>}
      <div style={{ width: '72px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E8E8E8', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ background: '#00C060', padding: '5px 0', textAlign: 'center', fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>{day}</div>
        <div style={{ background: '#FFFFFF', padding: '8px 4px 6px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0D0D0D', lineHeight: 1 }}>{num}</div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{month}</div>
          <div style={{ fontSize: '10px', color: '#aaa' }}>{year}</div>
        </div>
      </div>
    </div>
  )
}

// SVG Icons
const IconPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="3"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
  </svg>
)
const IconEye = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconMap = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
)
const IconUsers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const IconLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)
const IconCheck = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconArrowDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
  </svg>
)
const IconGlobe = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

function fmt(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function TriplistPage() {
  const { username, slug } = useParams<{ username: string; slug: string }>()
  const [data, setData] = useState<Triplist | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.get(`/api/triplists/view/${username}/${slug}`)
      .then(r => { setData(r.data); document.title = `${r.data.title} — getdatewith.me` })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [username, slug])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>Yükleniyor…</div>
  )
  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>Triplist bulunamadı.</div>
  )

  const teamList = data.teamMembers ? data.teamMembers.split(',').map(s => s.trim()).filter(Boolean) : []

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F7', color: '#0D0D0D', fontFamily: 'Raleway, sans-serif' }}>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 80px' }}>
        {/* Geri + breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Link to="/topluluk" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555', textDecoration: 'none', fontSize: '13px', fontWeight: 600, background: '#fff', border: '1px solid #E8E8E8', borderRadius: '9999px', padding: '5px 12px 5px 8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Triplist
          </Link>
          <span style={{ color: '#CCC', fontSize: '12px' }}>›</span>
          <span style={{ color: '#888', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.title}</span>
        </div>

        <style>{`@media(max-width:768px){.tl-grid{grid-template-columns:1fr!important}.tl-sticky{position:static!important}}`}</style>
        <div className="tl-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' }}>

          {/* ─── SOL ─── */}
          <div>
            {/* Başlık kartı */}
            <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #EBEBEB', padding: '28px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              {/* Badges */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#F3F3F3', border: '1px solid #E8E8E8', borderRadius: '100px', padding: '4px 11px', fontSize: '12px', color: '#555' }}>
                  <IconGlobe /> {data.country}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#F3F3F3', border: '1px solid #E8E8E8', borderRadius: '100px', padding: '4px 11px', fontSize: '12px', color: '#555' }}>
                  <IconPin /> {data.city}{data.district ? `, ${data.district}` : ''}
                </span>
              </div>

              <h1 style={{ fontWeight: 800, fontSize: '28px', margin: '0 0 10px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>{data.title}</h1>
              {data.description && <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: '0 0 18px' }}>{data.description}</p>}

              {/* Yazar + meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '16px', borderTop: '1px solid #F0F0F0', flexWrap: 'wrap' }}>
                <AvatarDisplay avatarId={data.user.avatarId || 'kedi'} size={30} />
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{data.user.name}</span>
                <span style={{ color: '#bbb', fontSize: '12px' }}>@{data.user.username}</span>
                <span style={{ color: '#E0E0E0' }}>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#999', fontSize: '12px' }}><IconEye /> {data.viewCount} görüntülenme</span>
                <span style={{ color: '#E0E0E0' }}>·</span>
                <span style={{ color: '#999', fontSize: '12px' }}>{data.stops.length} durak</span>
              </div>
            </div>

            {/* Roadmap */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {data.stops.map((stop, i) => (
                <div key={stop.id}>
                  {/* Durak kartı */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'stretch' }}>
                    {/* Zaman çizgisi */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '36px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#00C060', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,192,96,0.35)' }}>{stop.order}</div>
                      {i < data.stops.length - 1 && (
                        <div style={{ width: '2px', flex: 1, minHeight: '16px', background: 'linear-gradient(to bottom, #00C060, #E0E0E0)', opacity: 0.5, marginTop: '4px' }} />
                      )}
                    </div>

                    {/* Kart */}
                    <div style={{ flex: 1, paddingBottom: i < data.stops.length - 1 ? '0' : '0' }}>
                      <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '18px 20px', marginBottom: stop.transitMode && i < data.stops.length - 1 ? '0' : '0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{stop.venueName}</div>
                        {stop.address && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                            <IconPin /> {stop.address}
                          </div>
                        )}
                        {stop.description && <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.5', borderLeft: '2px solid #E8E8E8', paddingLeft: '10px' }}>{stop.description}</div>}
                        {stop.venueId && (
                          <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0,192,96,0.08)', border: '1px solid rgba(0,192,96,0.2)', borderRadius: '100px', padding: '3px 10px', fontSize: '11px', color: '#00C060', fontWeight: 600 }}>
                            <IconCheck /> Veritabanımızda mevcut
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transit köprüsü */}
                  {i < data.stops.length - 1 && (
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'stretch' }}>
                      <div style={{ width: '36px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: '2px', background: 'linear-gradient(to bottom, #E0E0E0, #00C060)', opacity: 0.4 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        {stop.transitMode ? (
                          <div style={{ margin: '6px 0', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F8F8F8', border: '1px dashed #DCDCDC', borderRadius: '10px', padding: '7px 14px', fontSize: '12px', color: '#777' }}>
                            <span style={{ color: '#555' }}>{TRANSIT_MODE_ICONS[stop.transitMode] || <IconArrowDown />}</span>
                            <span style={{ fontWeight: 600, color: '#555' }}>{stop.transitMode}</span>
                            {stop.transitLine && (
                              <span style={{ background: '#EAEAEA', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, color: '#444' }}>{stop.transitLine}</span>
                            )}
                            {stop.transitNote && <span style={{ color: '#999', fontSize: '11px' }}>— {stop.transitNote}</span>}
                          </div>
                        ) : (
                          <div style={{ height: '12px' }} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Kopyala butonu */}
            <div style={{ marginTop: '20px' }}>
              <button onClick={copyLink}
                style={{ width: '100%', padding: '13px', borderRadius: '14px', background: copied ? 'rgba(0,192,96,0.08)' : '#FFFFFF', border: `1.5px solid ${copied ? '#00C060' : '#E0E0E0'}`, color: copied ? '#00C060' : '#555', fontWeight: 600, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                <IconLink />
                {copied ? 'Link kopyalandı!' : 'Linki Kopyala'}
              </button>
            </div>
          </div>

          {/* ─── SAĞ PANEL ─── */}
          <div className="tl-sticky" style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Tarih */}
            {(data.startDate || data.endDate) && (
              <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '18px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '16px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#00C060', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Tarih</span>
                </div>

                <CalendarBlock dateStr={(data.startDate || data.endDate)!} label="O tarihte olduğum yer" />
              </div>
            )}

            {/* Ekip */}
            {teamList.length > 0 && (
              <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '18px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '14px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#00C060', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Ekip</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {teamList.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: `hsl(${(i * 67 + 140) % 360}, 55%, 88%)`,
                        border: `1.5px solid hsl(${(i * 67 + 140) % 360}, 45%, 78%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 700,
                        color: `hsl(${(i * 67 + 140) % 360}, 50%, 35%)`
                      }}>
                        {m[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Güzergah */}
            <div style={{ background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '18px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '14px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
                </svg>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#00C060', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Güzergah</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {data.stops.map((stop, i) => (
                  <div key={stop.id} style={{ display: 'flex', alignItems: 'stretch', gap: '10px' }}>
                    {/* mini timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#00C060', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
                      {i < data.stops.length - 1 && (
                        <div style={{ width: '1.5px', flex: 1, minHeight: '12px', background: '#E8E8E8', margin: '3px 0' }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < data.stops.length - 1 ? '10px' : '0', paddingTop: '3px' }}>
                      <span style={{ fontSize: '12px', color: '#444', fontWeight: 500 }}>{stop.venueName}</span>
                      {stop.address && <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px' }}>{stop.address}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
