const multer = require('multer')
const path   = require('path')

const makeStorage = (dest) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename:    (req, file, cb) => {
      const ext = path.extname(file.originalname)
      cb(null, Date.now() + ext)
    }
  })

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png']
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('jpg, png만 허용됩니다'))
}

// 정자세 / 랜덤 사진용
const postureUpload = multer({
  storage: makeStorage('uploads/posture'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})

// 스트레칭 이미지용
const stretchUpload = multer({
  storage: makeStorage('uploads/stretching'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})

module.exports = { postureUpload, stretchUpload }