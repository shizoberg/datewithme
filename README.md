# datewith.me

Date teklifi uygulaması.

## Klasör yapısı
- `client/` — React + Vite frontend (Vercel)
- `server/` — Express + Prisma backend (Railway)

## Local geliştirme

### Backend
```bash
cd server
cp .env.example .env   # DB bağlantısını doldur
npm install
npx prisma db push
npm run dev
```

### Frontend
```bash
cd client
cp .env.example .env   # VITE_API_URL boş bırak (proxy çalışır)
npm install
npm run dev
```

## Deploy

### Railway (backend)
- Root Directory: `server`
- Build Command: `npm run build`
- Start Command: `npm start`
- Env vars: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`

### Vercel (frontend)
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Env vars: `VITE_API_URL=https://your-api.railway.app`
