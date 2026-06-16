import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth'
import cardsRouter from './routes/cards'
import publicRouter from './routes/public'
import gnoRouter from './routes/gno'
import venueRouter from './routes/venues'
import venueSubmissionRouter from './routes/venueSubmissions'

const app = express()
const PORT = process.env.PORT || 3000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRouter)
app.use('/api/cards', cardsRouter)
app.use('/api/public', publicRouter)
app.use('/api/gno', gnoRouter)
app.use('/api/venues', venueRouter)
app.use('/api/venue-submissions', venueSubmissionRouter)
app.use('/api/admin/venue-submissions', venueSubmissionRouter)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
