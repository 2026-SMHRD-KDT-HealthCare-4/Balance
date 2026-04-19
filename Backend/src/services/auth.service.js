const bcrypt = require('bcrypt')
const { sign } = require('../config/jwt')
const { User, Session, AiReport, PostureData, sequelize } = require('../models')
const { Op } = require('sequelize');

// 회원가입
const register = async (userData) => {
  console.log("가입 요청 데이터:", userData);

  // 🌟 1. userData에서 age를 추가로 구조 분해 할당합니다.
  const { login_id, email, password, name, age, tempId } = userData;

  // 중복 체크
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
      age: age || 25, // 🌟 2. DB 모델에 age를 저장합니다. (값이 없으면 기본값 25)
      provider: 'local',
      provider_id: null
    }, { transaction: t });


// [B] 비회원 데이터 이관 (가장 확실한 방법)
if (tempId) {
    // 1. 먼저 내 tempId에 연결된 모든 세션 번호를 가져옵니다.
    const mySessions = await Session.findAll({ 
        where: { temp_uuid: tempId },
        transaction: t 
    });
    const sessionIds = mySessions.map(s => s.session_id);

    if (sessionIds.length > 0) {
        // 2. 세션들의 주인 변경
        await Session.update({ user_id: newUser.user_id }, { where: { session_id: { [Op.in]: sessionIds } }, transaction: t });

        // 3. 🔥 핵심: 사진 데이터(PostureData)의 주인도 내 ID로 변경
        await PostureData.update({ user_id: newUser.user_id }, { where: { session_id: { [Op.in]: sessionIds } }, transaction: t });

        // 4. 🔥 기존 분석 결과(AiReport)의 주인도 내 ID로 변경
        await AiReport.update({ user_id: newUser.user_id }, { where: { session_id: { [Op.in]: sessionIds } }, transaction: t });
    }
}

// [C] 초기 AI 리포트 생성 부분은 이제 '진짜 데이터'가 없을 때만 필요합니다.
// 만약 위에서 이관된 리포트가 있다면, 이 [C] 로직은 사실상 중복이 됩니다.
// 하지만 안전을 위해 놔두신다면, '환영 문구' 정도로만 유지하세요.

    // [C] 초기 AI 리포트 생성
    await AiReport.create({
      user_id: newUser.user_id,
      report_text: `${name}님, 환영합니다! 분석을 시작합니다.`,
      prescription_text: "",
      score: 100, // 🌟 3. 초기 점수를 0점 대신 100점으로 설정하면 목 나이 폭등을 방지할 수 있습니다.
      balance_shoulder: 0,
      balance_neck: 0,
      balance_head: 0,
      compliance_score: 0,
      accuracy_score: 0,
      report_type: 'daily'
    }, { transaction: t });

    await t.commit();

    return { 
      message: '가입 성공',
      user_id: newUser.user_id
    }

  } catch (error) {
    if (t) await t.rollback();
    console.error("Register Service Error:", error);
    throw { status: 500, message: '회원가입 처리 중 서버 오류가 발생했습니다' };
  }
}

// 로그인 (기존과 동일)
const login = async ({ login_id, password }) => {
  const user = await User.findOne({ where: { login_id } })
  if (!user) throw { status: 401, message: '아이디 또는 비밀번호가 일치하지 않습니다' }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw { status: 401, message: '아이디 또는 비밀번호가 일치하지 않습니다' }

  const token = sign({ user_id: user.user_id, login_id: user.login_id })

  return {
    message: '로그인 성공',
    token,
    user: { 
      user_id: user.user_id, 
      login_id: user.login_id, 
      name: user.name,
      age: user.age // 🌟 로그인 응답에도 age를 포함하면 프론트에서 활용하기 좋습니다.
    }
  }
}

// 소셜 로그인 (필요시 age 추가 가능)
const socialLogin = async ({ email, name, provider, provider_id }) => {
  let user = await User.findOne({ where: { provider, provider_id } })

  if (!user) {
    user = await User.create({
      name,
      login_id: email,
      email,
      provider,
      provider_id,
      password: null,
      age: 25 // 소셜 로그인은 나이를 바로 알 수 없으므로 기본값 설정
    })
  }

  const token = sign({ user_id: user.user_id, login_id: user.login_id })

  return {
    token,
    user: { user_id: user.user_id, login_id: user.login_id, name: user.name }
  }
}

module.exports = { register, login, socialLogin }