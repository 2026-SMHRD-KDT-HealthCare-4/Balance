const express = require('express')
const cors = require('cors')
const path = require('path')
const session = require('express-session')
const passport = require('./config/passport')
const errorHandler = require('./middlewares/error.middleware')

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// passport 세션 설정 (소셜 로그인에 필요)
app.use(session({
  secret: process.env.JWT_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/sessions', require('./routes/session.routes'))
app.use('/api/posture', require('./routes/posture.routes'))
app.use('/api/stretching', require('./routes/stretching.routes'))
app.use('/api/stats', require('./routes/stats.routes'))
app.use('/api/admin', require('./routes/admin.routes'))

app.use(errorHandler)

module.exports = app
