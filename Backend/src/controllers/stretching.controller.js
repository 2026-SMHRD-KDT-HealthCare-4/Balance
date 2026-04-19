const stretchingService = require('../services/stretching.service')

// 스트레칭 기록 저장
const saveStretchingLog = async (req, res, next) => {
  try {
    const result = await stretchingService.save(req.body)
    res.status(201).json(result)
  } catch (e) { next(e) }
}

// 세션별 스트레칭 기록 조회
const getStretchingBySession = async (req, res, next) => {
  try {
    const result = await stretchingService.getBySession(req.params.session_id)
    res.status(200).json(result)
  } catch (e) { next(e) }
}

module.exports = { saveStretchingLog, getStretchingBySession }