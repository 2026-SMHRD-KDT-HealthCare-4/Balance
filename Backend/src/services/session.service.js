const { Session } = require('../models')

const start = async (user_id) => {
  const session = await Session.create({ user_id })
  return session
}

const end = async (session_id, user_id) => {
  const session = await Session.findOne({ where: { session_id, user_id } })
  if (!session) throw { status: 404, message: '세션을 찾을 수 없습니다' }
  await session.update({ end_time: new Date() })
  return session
}

const updatePhotos = async (session_id, user_id, photos) => {
  const session = await Session.findOne({ where: { session_id, user_id } })
  if (!session) throw { status: 404, message: '세션을 찾을 수 없습니다' }
  await session.update(photos)
  return session
}

module.exports = { start, end, updatePhotos }