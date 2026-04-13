const fs = require('fs')
const path = require('path')

const uploadStretchImage = (req, res, next) => {
  try {
    if (!req.file) throw { status: 400, message: '파일이 없습니다' }
    res.status(201).json({
      filename: req.file.filename,
      image_url: `/uploads/stretching/${req.file.filename}`
    })
  } catch (e) { next(e) }
}

const deleteStretchImage = (req, res, next) => {
  try {
    const filePath = path.join('uploads/stretching', req.params.filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    res.status(200).json({ message: '삭제 완료' })
  } catch (e) { next(e) }
}

module.exports = { uploadStretchImage, deleteStretchImage }