const bcrypt = require('bcrypt')
const { sign } = require('../config/jwt')
const { User, Session, AiReport, sequelize } = require('../models')

// 회원가입
const register = async (userData) => {
  console.log("가입 요청 데이터:", userData);

  const { login_id, email, password, name, tempId } = userData;

  // 1. 중복 체크 (트랜잭션 시작 전 수행하여 부하 감소)
  const exists = await User.findOne({ where: { login_id } })
  if (exists) throw { status: 409, message: '이미 사용 중인 아이디입니다' }

  const emailExists = await User.findOne({ where: { email } })
  if (emailExists) throw { status: 409, message: '이미 사용 중인 이메일입니다' }

  const hashedPassword = await bcrypt.hash(password, 10)

  // 2. 트랜잭션 시작
  const t = await sequelize.transaction();

  try {
    // [A] 유저 생성
    const newUser = await User.create({
      name,
      login_id,
      email,
      password: hashedPassword,
      provider: 'local',
      provider_id: null
    }, { transaction: t });

    // [B] 비회원 데이터 이관
    if (tempId) {
      console.log("데이터 이관 시도 중, tempId:", tempId);
      await Session.update(
        { user_id: newUser.user_id }, 
        { where: { temp_uuid: tempId }, transaction: t }
      );
    }

    // [C] 초기 AI 리포트 생성
    await AiReport.create({
      user_id: newUser.user_id,
      report_text: `${name}님, 환영합니다! 분석을 시작합니다.`,
      prescription_text: "데이터 연동이 완료되었습니다. 대시보드를 확인해보세요!",
      score: 0,
      balance_shoulder: 0,
      balance_neck: 0,
      balance_head: 0,
      compliance_score: 0,
      accuracy_score: 0,
      report_type: 'daily'
    }, { transaction: t });

    // 모든 작업 성공 시 커밋
    await t.commit();

    return { 
      message: '가입 성공',
      user_id: newUser.user_id
    }

  } catch (error) {
    // 롤백 (t가 정의된 후 에러가 나야 하므로 try-catch 필수)
    if (t) await t.rollback();
    console.error("Register Service Error:", error);
    throw { status: 500, message: '회원가입 처리 중 서버 오류가 발생했습니다' };
  }
}

// 로그인
const login = async ({ login_id, password }) => {
  const user = await User.findOne({ where: { login_id } })
  if (!user) throw { status: 401, message: '아이디 또는 비밀번호가 일치하지 않습니다' }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw { status: 401, message: '아이디 또는 비밀번호가 일치하지 않습니다' }

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