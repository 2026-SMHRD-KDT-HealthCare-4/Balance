// src/routes/stats.routes.js
const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const statsController = require('../controllers/stats.controller'); // ✅ 경로 확인

router.get('/weekly', auth, statsController.getWeekly);
router.get('/monthly', auth, statsController.getMonthly);

router.get('/latest-report', auth, statsController.getLatestReport); // 최근 리포트
router.get('/grass', auth, statsController.getUsageGrass);           // 잔디 데이터

module.exports = router;