const router = require('express').Router()
const auth = require('../middlewares/auth.middleware')
const { stretchUpload } = require('../config/multer')
const { uploadStretchImage, deleteStretchImage } =
  require('../controllers/admin.controller')

// 스트레칭 이미지 등록
router.post('/stretching', auth,
  stretchUpload.single('image'), uploadStretchImage)
// 스트레칭 이미지 삭제
router.delete('/stretching/:filename', auth, deleteStretchImage)

module.exports = router