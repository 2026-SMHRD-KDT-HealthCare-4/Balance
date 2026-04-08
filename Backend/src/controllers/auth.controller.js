const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (e) { next(e); }
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