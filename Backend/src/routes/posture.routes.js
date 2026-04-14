const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const { savePostureData, getPostureBySession, saveBaseline, getLatest } = require('../controllers/posture.controller');

router.post('/log', auth, savePostureData);
router.get('/session/:session_id', auth, getPostureBySession);
router.post('/baseline', auth, saveBaseline);

router.get('/latest', auth, getLatest);

module.exports = router;