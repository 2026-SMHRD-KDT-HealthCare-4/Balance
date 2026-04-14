const { PostureData, Session } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini 설정
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * [1] 자세 데이터 저장
 */
const save = async (data) => {
  try {
    let finalSessionId = data.session_id;

    if (!finalSessionId) {
      if (data.user_id) {
        let session = await Session.findOne({
        where: { user_id: data.user_id },
        order: [['start_time', 'DESC']]
        });
        if (!session) session = await Session.create({ user_id: data.user_id });
        finalSessionId = session.session_id;
      } else {
        // 비회원: 주인 없는 세션 생성
        const session = await Session.create({ user_id: null });
        finalSessionId = session.session_id;
      }
    }

    if (!finalSessionId) throw new Error("세션 ID 확보 실패");

    return await PostureData.create({
      session_id: finalSessionId,
      neck_angle: data.neck_angle ?? null,
      shoulder_angle: data.shoulder_angle ?? null,
      posture_score: data.posture_score || 100,
      alarm_message: data.alarm_message || '정상',
      posture_measurement_time: new Date()
    });
  } catch (error) {
    console.error("Save Error:", error);
    throw error;
  }
};

/**
 * [2] 비회원 세션을 회원에게 연결 (회원가입/로그인 시 호출)
 */
const linkSessionToUser = async (sessionId, userId) => {
  try {
    return await Session.update(
      { user_id: userId },
      { where: { session_id: sessionId, user_id: null } }
    );
  } catch (error) {
    console.error("Link Error:", error);
    throw error;
  }
};

/**
 * [3] Gemini AI 처방전 생성 (동일 부분 채워넣음)
 */
const generateAiAdvice = async (data) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const prompt = `
      사용자: ${data.user_name || '회원'}님
      측정 부위: ${data.type === 'front' ? '정면' : '측면'}
      현재 상태: ${data.status}
      측정 수치: ${data.angle}도
      세부 데이터: ${JSON.stringify(data.details || {})}

      너는 AI 자세 교정 전문의야. 
      위 데이터를 분석해서 '오늘의 처방전'에 들어갈 조언을 딱 2문장으로 써줘.
      우리는 딱 두 가지 스트레칭만 제공해:
      1. '거북목 완화 스트레칭 (A)'
      2. '어깨 불균형 교정 스트레칭 (B)'
      데이터에 기반해서 가장 필요한 스트레칭 하나를 반드시 언급하고, 동기부여를 해줘.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini 호출 실패:", error);
    return "데이터 분석 중 오류가 발생했습니다. 평소처럼 스트레칭을 진행해 주세요!";
  }
};

/**
 * [4] 세션별 데이터 조회 (동일 부분 채워넣음)
 */
const getBySession = async (session_id) => {
  try {
    return await PostureData.findAll({ 
      where: { session_id },
      order: [['posture_measurement_time', 'ASC']]
    });
  } catch (error) {
    console.error("GetBySession Error:", error);
    throw error;
  }
};

/**
 * [5] 방치된 비회원 데이터 삭제 (Garbage Collection)
 */
const deleteAbandonedData = async () => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  try {
    const count = await Session.destroy({
      where: {
        user_id: null,
        start_time: { [Op.lt]: oneHourAgo }
      }
    });
    if (count > 0) console.log(`[Cleanup] ${count}개의 유효기간 만료 세션 삭제됨.`);
  } catch (error) {
    console.error("Cleanup Error:", error);
  }
};
/**
 * [6] 유저의 최신 세션 가져오기 (없으면 새로 생성)
 */
const getLatestSession = async (user_id) => {
  try {
    let session = await Session.findOne({
      where: { user_id: user_id ?? null },
      order: [['start_time', 'DESC']]
    });

    if (!session) {
      session = await Session.create({ user_id: user_id ?? null });
    }

    return session;
  } catch (error) {
    console.error("GetLatestSession Error:", error);
    throw error;
  }
};

module.exports = { 
  save, 
  getBySession, 
  generateAiAdvice, 
  linkTempDataToUser: linkSessionToUser, 
  linkSessionToUser,
  deleteAbandonedData,
  getLatestSession 
};