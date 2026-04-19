const { Session } = require('../models');

/**
 * [1] 세션 시작 (회원/비회원 공통)
 * @param {number|null} user_id - 회원 ID (비회원이면 null)
 * @param {string|null} temp_id - 비회원 식별용 임시 ID (프론트 localStorage 발급분)
 */
const start = async (user_id, temp_id = null) => {
  try {
    return await Session.create({
      user_id: user_id || null, // 비회원일 때 DB에 null로 저장
      temp_id: temp_id,         // 비회원 마이그레이션을 위한 식별자
      start_time: new Date()
    });
  } catch (error) {
    console.error("[Session Service] Start Error:", error);
    throw error;
  }
};

/**
 * [2] 세션 종료
 * @param {number} session_id 
 * @param {number|null} user_id 
 */
const end = async (session_id, user_id = null) => {
  try {
    // ✅ 회원이면 본인 세션인지 확인, 비회원이면 해당 session_id의 주인 없는 데이터 확인
    const where = user_id 
      ? { session_id, user_id } 
      : { session_id, user_id: null };

    const session = await Session.findOne({ where });
    
    if (!session) {
      throw { status: 404, message: '유효하지 않은 세션이거나 접근 권한이 없습니다.' };
    }

    return await session.update({ end_time: new Date() });
  } catch (error) {
    console.error("[Session Service] End Error:", error);
    throw error;
  }
};

/**
 * [3] 사진 업로드 및 세션 데이터 업데이트
 * @param {number} session_id 
 * @param {number|null} user_id 
 * @param {object} photos - { upright_posture_photo, random_photo 등 }
 */
const updatePhotos = async (session_id, user_id = null, photos) => {
  try {
    const where = user_id 
      ? { session_id, user_id } 
      : { session_id, user_id: null };

    const session = await Session.findOne({ where });
    
    if (!session) {
      throw { status: 404, message: '업데이트할 세션을 찾을 수 없습니다.' };
    }

    // 전달받은 사진 경로 데이터를 세션 테이블에 업데이트
    return await session.update(photos);
  } catch (error) {
    console.error("[Session Service] UpdatePhotos Error:", error);
    throw error;
  }
};

module.exports = { 
  start, 
  end, 
  updatePhotos 
};