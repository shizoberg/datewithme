import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
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

const TRANSIT_ICONS: Record<string, string> = {
  'yürüyüş': '🚶', 'otobüs': '🚌', 'metro': '🚇',
  'tramvay': '🚋', 'taksi': '🚕', 'araba': '🚗', 'feribot': '⛴️',
}

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
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0D0D0D', fontFamily: 'Raleway, sans-serif' }}>
      <AppHeader />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: '#444', marginBottom: '24px' }}>
          <Link to="/topluluk" style={{ color: '#444', textDecoration: 'none' }}>Topluluk</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#666' }}>{data.title}</span>
        </div>

        <style>{`@media(max-width:768px){.tl-grid{grid-template-columns:1fr!important}.tl-sticky{position:static!important}}`}</style>
        <div className="tl-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', alignItems: 'start' }}>
          {/* SOL — Roadmap */}
          <div>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ background: '#F0F0F0', border: '1px solid #E0E0E0', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#666' }}>🌍 {data.country}</span>
                <span style={{ background: '#F0F0F0', border: '1px solid #E0E0E0', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#666' }}>📍 {data.city}{data.district ? `, ${data.district}` : ''}</span>
              </div>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '32px', margin: '0 0 12px' }}>{data.title}</h1>
              {data.description && <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{data.description}</p>}

              {/* Kullanıcı + meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AvatarDisplay avatarId={data.user.avatarId || 'kedi'} size={32} />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{data.user.name}</span>
                  <span style={{ color: '#444', fontSize: '12px' }}>@{data.user.username}</span>
                </div>
                <span style={{ color: '#444', fontSize: '12px' }}>·</span>
                <span style={{ color: '#444', fontSize: '12px' }}>👁 {data.viewCount} görüntülenme</span>
                <span style={{ color: '#444', fontSize: '12px' }}>·</span>
                <span style={{ color: '#444', fontSize: '12px' }}>{data.stops.length} durak</span>
              </div>
            </div>

            {/* Roadmap */}
            <div style={{ position: 'relative' }}>
              {data.stops.map((stop, i) => (
                <div key={stop.id}>
                  {/* Durak */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {/* Sol — numara + çizgi */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#00C060', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>{stop.order}</div>
                      {i < data.stops.length - 1 && (
                        <div style={{ width: '2px', flex: 1, minHeight: '60px', background: 'linear-gradient(#00F68040, #2A2A2A)', marginTop: '4px' }} />
                      )}
                    </div>

                    {/* Sağ — içerik */}
                    <div style={{ flex: 1, paddingBottom: i < data.stops.length - 1 ? '0' : '0' }}>
                      <div style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: '14px', padding: '18px', marginBottom: '0' }}>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', marginBottom: '4px' }}>{stop.venueName}</div>
                        {stop.address && <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>📍 {stop.address}</div>}
                        {stop.description && <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>{stop.description}</div>}
                        {stop.venueId && (
                          <div style={{ marginTop: '10px', fontSize: '11px', color: '#00C060', fontWeight: 600 }}>✓ Veritabanımızda mevcut</div>
                        )}
                      </div>

                      {/* Ulaşım köprüsü */}
                      {i < data.stops.length - 1 && stop.transitMode && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', margin: '8px 0', background: '#FFFFFF', border: '1px dashed #2A2A2A', borderRadius: '10px', fontSize: '13px', color: '#666' }}>
                          <span>{TRANSIT_ICONS[stop.transitMode] || '🚌'}</span>
                          <span style={{ fontWeight: 600, color: '#666' }}>{stop.transitMode}</span>
                          {stop.transitLine && <span style={{ background: '#F0F0F0', border: '1px solid #333', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>{stop.transitLine}</span>}
                          {stop.transitNote && <span style={{ color: '#444', fontSize: '12px' }}>— {stop.transitNote}</span>}
                          <span style={{ marginLeft: 'auto', fontSize: '16px', color: '#333' }}>↓</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paylaş butonu */}
            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
              <button onClick={copyLink}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#F0F0F0', border: '1px solid #E0E0E0', color: copied ? '#00C060' : '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {copied ? '✓ Link kopyalandı!' : '🔗 Linki Kopyala'}
              </button>
            </div>
          </div>

          {/* SAĞ — Panel */}
          <div className="tl-sticky" style={{ position: 'sticky', top: '24px' }}>
            {/* Tarih */}
            {(data.startDate || data.endDate) && (
              <div style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#444', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>📅 Tarih</div>
                {data.startDate && data.endDate ? (
                  <>
                    <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '4px' }}>{fmt(data.startDate)}</div>
                    <div style={{ fontSize: '12px', color: '#444' }}>→</div>
                    <div style={{ fontSize: '14px', color: '#aaa', marginTop: '4px' }}>{fmt(data.endDate)}</div>
                  </>
                ) : (
                  <div style={{ fontSize: '14px', color: '#aaa' }}>{fmt(data.startDate || data.endDate)}</div>
                )}
              </div>
            )}

            {/* Ekip */}
            {teamList.length > 0 && (
              <div style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#444', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>👥 Ekip</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {teamList.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F0F0F0', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#666' }}>{m[0]?.toUpperCase()}</div>
                      <span style={{ fontSize: '14px' }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Durak özeti */}
            <div style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#444', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>🗺️ Güzergah</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.stops.map((stop, i) => (
                  <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#00F68020', border: '1px solid #00F68050', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#00C060', flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: '13px', color: '#aaa' }}>{stop.venueName}</span>
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
