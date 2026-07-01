import nodemailer from 'nodemailer'

const ADMIN_EMAIL = 'berkaktas@windowslive.com'

// SMTP transporter — env var'larla yapılandır
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS olmadığında sadece console log
function createTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: { user, pass },
  })
}

export async function sendMail(subject: string, html: string) {
  const transporter = createTransporter()
  if (!transporter) {
    console.log(`[MAIL] To: ${ADMIN_EMAIL} | Subject: ${subject}`)
    return
  }
  try {
    await transporter.sendMail({
      from: `"getdatewith.me" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject,
      html,
    })
  } catch (e) {
    console.error('[MAIL ERROR]', e)
  }
}

export async function notifyNewInfluencerApplication(name: string, city: string, instagram: string, email?: string) {
  await sendMail(
    `🌟 Yeni Influencer Başvurusu: ${name}`,
    `<h2>Yeni influencer başvurusu geldi</h2>
     <p><b>Ad:</b> ${name}</p>
     <p><b>Şehir:</b> ${city}</p>
     <p><b>Instagram:</b> ${instagram}</p>
     ${email ? `<p><b>E-posta:</b> ${email}</p>` : ''}
     <p><a href="https://www.getdatewith.me/admin">Admin panelinde görüntüle →</a></p>`
  )
}

export async function notifyInfluencerApproved(name: string, email?: string) {
  await sendMail(
    `✅ Influencer Onaylandı: ${name}`,
    `<h2>${name} onaylandı</h2>
     ${email ? `<p>E-posta: ${email}</p>` : ''}
     <p>Artık platform üzerinde aktif.</p>`
  )
}
