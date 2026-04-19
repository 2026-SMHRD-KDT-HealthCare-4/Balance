const { verify } = require('../config/jwt')

const authMiddleware = (req, res, next) => {
  const header = req.headers['authorization']
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: '토큰이 없습니다' })
  }
  try {
    const token = header.split(' ')[1]
    const payload = verify(token)
    req.user = payload   // { user_id, email }
    next()
  } catch (e) {
    res.status(401).json({ message: '토큰이 만료되었거나 유효하지 않습니다' })
  }
}

module.exports = authMiddleware