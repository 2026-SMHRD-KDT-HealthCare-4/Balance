const router = require('express').Router()
const auth = require('../middlewares/auth.middleware')
const { postureUpload } = require('../config/multer')
const { startSession, endSession, uploadPosturePhoto } =
  require('../controllers/session.controller')

router.post('/start', auth, startSession)
router.patch('/:session_id/end', auth, endSession)
// 정자세 기준 사진 업로드
router.post(
  '/:session_id/photo',
  auth,
  postureUpload.fields([
    { name: 'upright_posture_photo', maxCount: 1 },
    { name: 'random_photo', maxCount: 1 }
  ]),
  uploadPosturePhoto
)

module.exports = router