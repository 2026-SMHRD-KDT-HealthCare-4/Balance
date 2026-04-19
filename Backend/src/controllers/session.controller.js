const sessionService = require('../services/session.service')

const startSession = async (req, res, next) => {
  try {
    const session = await sessionService.start(req.user.user_id)
    res.status(201).json(session)
  } catch (e) { next(e) }
}

const endSession = async (req, res, next) => {
  try {
    const session = await sessionService.end(
      req.params.session_id, req.user.user_id
    )
    res.status(200).json(session)
  } catch (e) { next(e) }
}

const uploadPosturePhoto = async (req, res, next) => {
  try {
    const photos = {}
    if (req.files?.upright_posture_photo)
      photos.upright_posture_photo = req.files.upright_posture_photo[0].filename
    if (req.files?.random_photo)
      photos.random_photo = req.files.random_photo[0].filename
    const session = await sessionService.updatePhotos(
      req.params.session_id, req.user.user_id, photos
    )
    res.status(200).json(session)
  } catch (e) { next(e) }
}

module.exports = { startSession, endSession, uploadPosturePhoto }