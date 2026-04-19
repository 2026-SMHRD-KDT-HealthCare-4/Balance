const { StretchingLog } = require('../models')

// 스트레칭 기록 저장
const save = async (data) => {
  const log = await StretchingLog.create({
    session_id: data.session_id,
    target_part: data.target_part,
    duration: data.duration,
    description: data.description || null,
    alarm_message: data.alarm_message || null
  })
  return log
}

// 세션별 스트레칭 기록 조회
const getBySession = async (session_id) => {
  const logs = await StretchingLog.findAll({
    where: { session_id },
    order: [['created_at', 'ASC']]
  })
  return logs
}

module.exports = { save, getBySession }