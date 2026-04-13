const router = require('express').Router()
const auth = require('../middlewares/auth.middleware')
const { saveStretchingLog, getStretchingBySession } = require('../controllers/stretching.controller')

// 스트레칭 기록 저장
router.post('/', auth, saveStretchingLog)

// 세션별 스트레칭 기록 조회
router.get('/session/:session_id', auth, getStretchingBySession)

module.exports = router