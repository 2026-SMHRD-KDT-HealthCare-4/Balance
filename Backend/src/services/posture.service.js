const { PostureData } = require('../models')

// 자세 데이터 저장
const save = async (data) => {
  const posture = await PostureData.create({
    session_id: data.session_id,
    neck_angle: data.neck_angle,
    shoulder_angle: data.shoulder_angle,
    posture_score: data.posture_score,
    alarm_message: data.alarm_message || null,
    posture_measurement_time: data.posture_measurement_time || new Date()
  })
  return posture
}

// 세션별 자세 기록 조회
const getBySession = async (session_id) => {
  const postureList = await PostureData.findAll({
    where: { session_id },
    order: [['posture_measurement_time', 'ASC']]
  })
  return postureList
}

module.exports = { save, getBySession }