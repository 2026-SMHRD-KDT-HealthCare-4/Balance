require('dotenv').config()
const app = require('./app')
const sequelize = require('./config/database')
const fs = require('fs')

// uploads 폴더는 src 폴더와 같은 레벨에 있어야 하므로 상위로 경로 설정
const uploadDirs = ['../uploads/posture', '../uploads/stretching']
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
})

const PORT = process.env.PORT || 3000

sequelize
  .authenticate()
  .then(() => {
    console.log(' DB 연결 성공')
    
    return sequelize.sync({ alter: true }) 
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`서버 실행 중 → http://localhost:${PORT}`)
    )
  })
  .catch(err => {
    console.error(' DB 연결 실패', err)
    process.exit(1)
  })