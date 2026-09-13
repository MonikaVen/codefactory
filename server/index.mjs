import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DB_PATH = path.join(DATA_DIR, 'db.json')
const JWT_SECRET = process.env.JWT_SECRET || 'ket-mokykla-dev-secret-change-me'
const PORT = Number(process.env.PORT || 3001)

const emptyProgress = () => ({
  studiedRules: [],
  masteredSigns: [],
  quizHistory: [],
  chapterScores: {},
  streak: 0,
  lastStudyDate: null,
  updatedAt: new Date().toISOString(),
})

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DB_PATH)) {
    const adminId = randomUUID()
    const now = new Date().toISOString()
    const db = {
      users: [
        {
          id: adminId,
          email: 'admin@ket.lt',
          name: 'Administratorius',
          passwordHash: bcrypt.hashSync('admin123', 10),
          role: 'admin',
          active: true,
          createdAt: now,
        },
      ],
      progress: {
        [adminId]: emptyProgress(),
      },
      history: [],
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
  }
}

function readDb() {
  ensureDb()
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active !== false,
    createdAt: user.createdAt,
  }
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: '30d',
  })
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Reikia prisijungti.' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const db = readDb()
    const user = db.users.find((u) => u.id === payload.sub)
    if (!user) return res.status(401).json({ error: 'Vartotojas nerastas.' })
    if (user.active === false) return res.status(403).json({ error: 'Paskyra išjungta.' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Sesija nebegalioja.' })
  }
}

function adminRequired(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Reikia administratoriaus teisių.' })
  }
  next()
}

function normalizeProgress(incoming) {
  return {
    studiedRules: Array.isArray(incoming?.studiedRules) ? incoming.studiedRules : [],
    masteredSigns: Array.isArray(incoming?.masteredSigns) ? incoming.masteredSigns : [],
    quizHistory: Array.isArray(incoming?.quizHistory) ? incoming.quizHistory : [],
    chapterScores:
      incoming?.chapterScores && typeof incoming.chapterScores === 'object'
        ? incoming.chapterScores
        : {},
    streak: Number.isFinite(Number(incoming?.streak)) ? Number(incoming.streak) : 0,
    lastStudyDate: typeof incoming?.lastStudyDate === 'string' ? incoming.lastStudyDate : null,
    updatedAt: new Date().toISOString(),
  }
}

function pushHistory(db, userId, type, detail = '', meta = {}) {
  db.history.push({
    id: randomUUID(),
    userId,
    type,
    detail: String(detail || ''),
    meta,
    createdAt: new Date().toISOString(),
  })
  if (db.history.length > 5000) {
    db.history = db.history.slice(-5000)
  }
}

ensureDb()
const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/auth/register', (req, res) => {
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase()
  const name = String(req.body?.name || '').trim()
  const password = String(req.body?.password || '')

  if (!email || !name || password.length < 6) {
    return res.status(400).json({ error: 'Įveskite vardą, el. paštą ir slaptažodį (min. 6 simb.).' })
  }

  const db = readDb()
  if (db.users.some((u) => u.email === email)) {
    return res.status(409).json({ error: 'Šis el. paštas jau užregistruotas.' })
  }

  const user = {
    id: randomUUID(),
    email,
    name,
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'user',
    active: true,
    createdAt: new Date().toISOString(),
  }
  db.users.push(user)
  db.progress[user.id] = emptyProgress()
  pushHistory(db, user.id, 'register', `Registracija: ${email}`, { email })
  writeDb(db)

  res.status(201).json({ token: signToken(user), user: publicUser(user) })
})

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase()
  const password = String(req.body?.password || '')
  const db = readDb()
  const user = db.users.find((u) => u.email === email)
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Neteisingas el. paštas arba slaptažodis.' })
  }
  if (user.active === false) {
    return res.status(403).json({ error: 'Paskyra išjungta. Susisiekite su administratoriumi.' })
  }
  pushHistory(db, user.id, 'login', 'Prisijungimas', {})
  writeDb(db)
  res.json({ token: signToken(user), user: publicUser(user) })
})

app.get('/api/auth/me', authRequired, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

app.get('/api/progress', authRequired, (req, res) => {
  const db = readDb()
  const progress = normalizeProgress(db.progress[req.user.id] || emptyProgress())
  res.json({ progress })
})

app.put('/api/progress', authRequired, (req, res) => {
  const db = readDb()
  const next = normalizeProgress(req.body?.progress)
  db.progress[req.user.id] = next
  writeDb(db)
  res.json({ progress: next })
})

app.get('/api/history', authRequired, (req, res) => {
  const db = readDb()
  const limit = Math.min(Number(req.query.limit) || 50, 200)
  const items = db.history
    .filter((h) => h.userId === req.user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
  res.json({ history: items })
})

app.post('/api/history', authRequired, (req, res) => {
  const type = String(req.body?.type || '').trim()
  const detail = String(req.body?.detail || '')
  const meta = req.body?.meta && typeof req.body.meta === 'object' ? req.body.meta : {}
  if (!type) return res.status(400).json({ error: 'Trūksta įvykio tipo.' })
  const db = readDb()
  pushHistory(db, req.user.id, type, detail, meta)
  writeDb(db)
  res.status(201).json({ ok: true })
})

app.get('/api/admin/stats', authRequired, adminRequired, (_req, res) => {
  const db = readDb()
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const activeUsers = new Set(
    db.history.filter((h) => new Date(h.createdAt).getTime() >= weekAgo).map((h) => h.userId),
  ).size
  res.json({
    stats: {
      users: db.users.length,
      historyEvents: db.history.length,
      quizzes: db.history.filter((h) => h.type === 'quiz' || h.type === 'exam').length,
      activeUsers,
    },
  })
})

app.get('/api/admin/users', authRequired, adminRequired, (_req, res) => {
  const db = readDb()
  const users = db.users.map((u) => {
    const progress = normalizeProgress(db.progress[u.id] || emptyProgress())
    const userHistory = db.history.filter((h) => h.userId === u.id)
    const last = [...userHistory].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    return {
      ...publicUser(u),
      studiedRules: progress.studiedRules.length,
      masteredSigns: progress.masteredSigns.length,
      quizzes: progress.quizHistory.length,
      streak: progress.streak,
      lastStudyDate: progress.lastStudyDate,
      lastEventAt: last?.createdAt || null,
    }
  })
  res.json({ users })
})

app.get('/api/admin/users/:id/history', authRequired, adminRequired, (req, res) => {
  const db = readDb()
  const user = db.users.find((u) => u.id === req.params.id)
  if (!user) return res.status(404).json({ error: 'Vartotojas nerastas.' })
  const history = db.history
    .filter((h) => h.userId === req.params.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 200)
  res.json({
    user: publicUser(user),
    progress: normalizeProgress(db.progress[user.id] || emptyProgress()),
    history,
  })
})

app.patch('/api/admin/users/:id', authRequired, adminRequired, (req, res) => {
  const db = readDb()
  const user = db.users.find((u) => u.id === req.params.id)
  if (!user) return res.status(404).json({ error: 'Vartotojas nerastas.' })

  if (typeof req.body?.role === 'string' && ['user', 'admin'].includes(req.body.role)) {
    if (user.id === req.user.id && req.body.role !== 'admin') {
      return res.status(400).json({ error: 'Negalima pašalinti savo admin teisių.' })
    }
    user.role = req.body.role
  }

  if (typeof req.body?.active === 'boolean') {
    if (user.id === req.user.id && req.body.active === false) {
      return res.status(400).json({ error: 'Negalima išjungti savo paskyros.' })
    }
    user.active = req.body.active
  }

  writeDb(db)
  res.json({ user: publicUser(user) })
})

app.listen(PORT, () => {
  console.log(`KET API listening on http://localhost:${PORT}`)
})
