const authService = require('../services/auth.service');
// 🌟 비회원 데이터 연동을 위해 postureService를 가져와야 합니다.
const postureService = require('../services/posture.service'); 

console.log('--- authService 로드 체크 ---');
console.log('타입:', typeof authService);
console.log('내용물:', authService); 
console.log('---------------------------');


const register = async (req, res, next) => {
  try {
    // 1. 프론트에서 보낸 age를 추가로 꺼냅니다.
    const { login_id, email, password, name, age, tempId } = req.body; 
    
    // 2. 서비스 함수에 age도 함께 전달합니다.
    const result = await authService.register({ 
      login_id, 
      email, 
      password, 
      name,
      age: parseInt(age) // 숫자로 확실히 변환하여 전달
    });
    
    // 3. 비회원 데이터 연동 (로그인한 유저 ID와 연결)
    if (tempId && result.user_id) {
      await postureService.linkTempDataToUser(tempId, result.user_id);
    }

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (e) { next(e); }
};

const social = async (req, res, next) => {
  try {
    const result = await authService.socialLogin(req.body);
    res.status(200).json(result);
  } catch (e) { next(e); }
};

module.exports = { register, login, social };