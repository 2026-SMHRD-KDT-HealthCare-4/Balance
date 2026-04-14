const authService = require('../services/auth.service');

console.log('--- authService 로드 체크 ---');
console.log('타입:', typeof authService);
console.log('내용물:', authService); 
console.log('---------------------------');


const register = async (req, res, next) => {
  try {
    // 1. 프론트에서 보낸 Payload와 이름을 똑같이 맞춰서 꺼냅니다.
    const { login_id, email, password, name, tempId } = req.body; 
    
    // 2. 서비스의 함수 이름은 'register'입니다. 
    // 객체 형태로 담아서 보냅니다. (login_id가 반드시 포함되어야 함)
    const result = await authService.register({ 
      login_id, 
      email, 
      password, 
      name 
    });
    
    // 3. 비회원 데이터 연동 (result에 user_id가 들어있어야 함)
    if (tempId && result.user_id) {
      // postureService가 import 되어 있는지 확인하세요
      await postureService.linkTempDataToUser(tempId, result.user_id);
    }

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

// 2. 로그인 함수 추가
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (e) { next(e); }
};

// 3. 기존에 있던 소셜 로그인 함수
const social = async (req, res, next) => {
  try {
    const result = await authService.socialLogin(req.body);
    res.status(200).json(result);
  } catch (e) { next(e); }
};

// 이제 세 함수 모두 정의되었으므로 에러 없이 내보낼 수 있습니다.
module.exports = { register, login, social };