const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/sessions', require('./routes/session.routes'));
app.use('/api/posture', require('./routes/posture.routes'));
app.use('/api/stretching', require('./routes/stretching.routes'));
app.use('/api/stats', require('./routes/stats.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.use(errorHandler);

// ← app.listen 제거 (server.js에서 실행)

module.exports = app;