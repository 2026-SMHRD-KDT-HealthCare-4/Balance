const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const errorHandler = require('./middlewares/error.middleware');
const postureService = require('./services/posture.service');

require('./config/passport'); // ✅ passport 전략 로드

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true // ✅ 세션 쿠키 허용
}));
app.use(express.json());

// ✅ 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'rebalance_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24시간
}));

// ✅ passport 초기화
app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/sessions', require('./routes/session.routes'));
app.use('/api/posture', require('./routes/posture.routes'));
app.use('/api/stretching', require('./routes/stretching.routes'));
app.use('/api/stats', require('./routes/stats.routes')); // 👈 Dashboard 관련
app.use('/api/admin', require('./routes/admin.routes'));

// 6. 🔥 주기적인 데이터 청소 (Garbage Collection) 로직
// 서버가 켜진 후 1분 뒤 첫 실행, 이후 1시간마다 '가입 안 한 임시 데이터' 삭제
setTimeout(() => {
  console.log('[Scheduler] 비회원 데이터 청소 시스템 가동...');
  postureService.deleteAbandonedData(); 
  
  setInterval(() => {
    postureService.deleteAbandonedData();
  }, 60 * 60 * 1000); // 1시간 간격
}, 60000);

app.use(errorHandler);

module.exports = app;