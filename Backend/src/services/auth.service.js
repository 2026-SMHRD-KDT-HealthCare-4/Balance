// src/services/auth.service.js
const bcrypt = require('bcrypt')
const { sign } = require('../config/jwt')
const { User } = require('../models')

// 회원가입
const register = async (userData) => {
  // 중복 아이디 체크
  const exists = await User.findOne({ where: { login_id: userData.login_id } })
  if (exists) throw { status: 409, message: '이미 사용 중인 아이디입니다' }

  // 중복 이메일 체크
  const emailExists = await User.findOne({ where: { email: userData.email } })
  if (emailExists) throw { status: 409, message: '이미 사용 중인 이메일입니다' }

  // 비밀번호 해시
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  const newUser = await User.create({
    name: userData.name,
    login_id: userData.login_id,
    email: userData.email,
    password: hashedPassword,  // ← 해시된 비밀번호 저장
    provider: 'local',
    provider_id: null
  })

  return { message: '회원가입 성공' }
}

// 로그인
const login = async ({ login_id, password }) => {
  // login_id로 유저 찾기
  const user = await User.findOne({ where: { login_id } })
  if (!user) throw { status: 401, message: '아이디 또는 비밀번호가 일치하지 않습니다' }

  // bcrypt로 비밀번호 비교  ← 평문 비교 대신
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw { status: 401, message: '아이디 또는 비밀번호가 일치하지 않습니다' }

  // JWT 토큰 발급
  const token = sign({ user_id: user.user_id, login_id: user.login_id })

  return {
    message: '로그인 성공',
    token,
    user: { user_id: user.user_id, login_id: user.login_id, name: user.name }
  }
}

// 소셜 로그인
const socialLogin = async ({ email, name, provider, provider_id }) => {
  let user = await User.findOne({ where: { provider, provider_id } })

  if (!user) {
    user = await User.create({
      name,
      login_id: email,
      email,
      provider,
      provider_id,
      password: null
    })
  }

  const token = sign({ user_id: user.user_id, login_id: user.login_id })

  return {
    token,
    user: { user_id: user.user_id, login_id: user.login_id, name: user.name }
  }
}

module.exports = { register, login, socialLogin }