const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const { 
  savePostureData, 
  getPostureBySession, 
  saveBaseline, 
  getLatest, 
  saveStretchingLog 
} = require('../controllers/posture.controller');

// 자세 데이터 저장
router.post('/log', auth, savePostureData);

// 세션 데이터 조회
router.get('/session/:session_id', auth, getPostureBySession);

// 정자세 기준값 저장
router.post('/baseline', auth, saveBaseline);

// 메인 페이지 최신 데이터 조회
router.get('/latest', auth, getLatest);

// ✅ 스트레칭 로그 저장 (하나만 유지)
router.post('/stretching', auth, saveStretchingLog);

module.exports = router;