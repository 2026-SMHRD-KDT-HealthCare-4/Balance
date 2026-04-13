require('dotenv').config()
const app = require('./app')
// [수정] database 설정 파일 대신, 모델이 통합된 index.js를 불러옵니다.
const { sequelize } = require('./models/index') 
const fs = require('fs')

// uploads 폴더 설정
const uploadDirs = ['../uploads/posture', '../uploads/stretching']
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
})

const PORT = process.env.PORT || 3000

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ DB 연결 성공');
    
    // [설명] 이제 User, Session 등 모든 모델이 로드된 상태에서 sync가 실행됩니다.
    // alter: true는 테이블이 없으면 생성하고, 있으면 구조를 맞춰줍니다.
    return sequelize.sync({ alter: true }); 
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 서버 실행 중 → http://localhost:${PORT}`)
    )
  })
  .catch(err => {
    console.error('❌ DB 연결 실패', err)
    process.exit(1)
  })