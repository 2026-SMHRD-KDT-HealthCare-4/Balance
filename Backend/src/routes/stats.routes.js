// src/routes/stats.routes.js
const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const statsController = require('../controllers/stats.controller'); // ✅ 경로 확인

router.get('/weekly', auth, statsController.getWeekly);
router.get('/monthly', auth, statsController.getMonthly);

module.exports = router;