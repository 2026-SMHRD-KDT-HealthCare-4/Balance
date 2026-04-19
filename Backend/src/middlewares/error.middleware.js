const errorHandler = (err, req, res, next) => {
  const status  = err.status || 500
  const message = err.message || '서버 오류가 발생했습니다'
  const response = { status, message }
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack
  }
  res.status(status).json(response)
}

module.exports = errorHandler