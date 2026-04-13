const { PostureData, Session, StretchingLog, sequelize } =
  require('../models')
const { Op, fn, col, literal } = require('sequelize')

const getWeekly = async (user_id) => {
  const from = new Date()
  from.setDate(from.getDate() - 7)

  const sessions = await Session.findAll({
    where: { user_id, start_time: { [Op.gte]: from } },
    attributes: ['session_id']
  })
  const sessionIds = sessions.map(s => s.session_id)

  const stats = await PostureData.findOne({
    where: { session_id: { [Op.in]: sessionIds } },
    attributes: [
      [fn('AVG', col('neck_angle')), 'avg_neck_angle'],
      [fn('AVG', col('posture_score')), 'avg_posture_score'],
      [fn('COUNT', col('posture_id')), 'total_records']
    ]
  })
  return stats
}

module.exports = { getWeekly }