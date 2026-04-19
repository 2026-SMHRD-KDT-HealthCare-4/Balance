require('dotenv').config()
const app = require('./app')
// [수정] database 설정 파일 대신, 모델이 통합된 index.js를 불러옵니다.
const { sequelize } = require('./models/index') 
const fs = require('fs')
const postureService = require('./services/posture.service');

// uploads 폴더 설정
const uploadDirs = ['../uploads/posture', '../uploads/stretching']
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
})

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ DB 연결 성공');
    
    // [수정] alter: false로 변경하거나 아예 옵션을 제거합니다.
    // 테이블 구조를 바꿀 일이 있다면 직접 SQL로 수정하는 것이 인덱스 꼬임을 방지하는 길입니다.
    return sequelize.sync({ force: false, alter: false }); 
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