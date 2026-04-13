const postureService = require('../services/posture.service')

// 자세 데이터 저장
const savePostureData = async (req, res, next) => {
  try {
    const result = await postureService.save(req.body)
    res.status(201).json(result)
  } catch (e) { next(e) }
}

// 세션별 자세 기록 조회
const getPostureBySession = async (req, res, next) => {
  try {
    const result = await postureService.getBySession(req.params.session_id)
    res.status(200).json(result)
  } catch (e) { next(e) }
}

module.exports = { savePostureData, getPostureBySession }