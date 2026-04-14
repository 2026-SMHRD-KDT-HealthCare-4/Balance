// src/controllers/posture.controller.js
const postureService = require('../services/posture.service');
const { User } = require('../models'); // ✅ 추가

/**
 * [1] 자세 데이터 저장 컨트롤러
 */
const savePostureData = async (req, res, next) => {
  try {
    // 1. 프론트엔드에서 더 디테일한 수치를 보낸다고 가정 (어깨수평차이, 머리기울기 등)
    const { angle, status, type, details } = req.body; 
    const user_id = req.user ? req.user.user_id : null;
    
    console.log("현재 요청 유저 ID:", user_id);

    const calculateLogic = (angle, type) => {
      if (type === 'side') {
        return Math.max(0, Math.min(100, (angle / 50) * 100));
      } else {
        return Math.max(0, 100 - (angle * 2)); 
      }
    };
    // 최신 세션 가져오기(session_id)
    const latestSession = await postureService.getLatestSession(user_id);
    
    if (!latestSession) {
      return res.status(400).json({ message: "활성화된 세션이 없습니다. 다시 로그인해주세요." });
    }

    // 2. 데이터 저장 (기존 로직 유지하되 점수 계산 로직 추가 가능)
    const dataToSave = {
      user_id: user_id,
      neck_angle: type === 'side' ? angle : null,
      shoulder_angle: type === 'front' ? angle : null,
      alarm_message: status,
      posture_score: calculateLogic(angle, type) // 점수화 로직(함수) 필요
    };

    const savedResult = await postureService.save(dataToSave);


    // 3. 🔥 여기서 Gemini API 호출 (AI 처방전 생성)
    // 매번 호출하면 비용이 발생하므로, 특정 조건(예: 오늘의 첫 측정)일 때만 호출하는 로직 권장
    let aiPrescription = null;
    if (type === 'front') { // 매일 아침 찍는 정면 데이터일 때 처방전 생성
      aiPrescription = await postureService.generateAiAdvice({
        angle,
        status,
        details, // 프론트에서 보낸 추가 좌표 데이터
        user_name: req.user.name 
      });
    }

    // 4. 최종 응답: 저장된 결과 + AI 처방전
    res.status(201).json({
      ...savedResult,
      aiPrescription: aiPrescription // 이게 대시보드 '약 봉투'에 담길 내용임
    });

  } catch (e) {
    console.error("컨트롤러 저장 및 AI 분석 에러:", e);
    next(e);
  }
};

/**
 * [2] 세션별 자세 데이터 조회 컨트롤러
 */
const getPostureBySession = async (req, res, next) => {
  try {
    const { session_id } = req.params;
    const result = await postureService.getBySession(session_id);
    res.status(200).json(result);
  } catch (e) {
    console.error("컨트롤러 조회 에러:", e);
    next(e);
  }
};

/**
 * [3] 정자세 기준값(Baseline) 저장 컨트롤러 ✅ 추가
 */
const saveBaseline = async (req, res, next) => {
  try {
    const { baseShoulderWidth, baseNeckDist, baseShoulderDiff } = req.body;
    const user_id = req.user.user_id;

    await User.update({
      base_shoulder_width: baseShoulderWidth,
      base_neck_dist: baseNeckDist,
      base_shoulder_diff: baseShoulderDiff
    }, {
      where: { user_id }
    });

    res.status(200).json({ message: '기준값 저장 완료' });
  } catch (e) {
    console.error('baseline 저장 에러:', e);
    next(e);
  }
};

const getLatest = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    
    // 서비스에서 최신 세션 가져오기
    const latestSession = await postureService.getLatestSession(user_id);

    if (!latestSession) {
      return res.status(200).json(null);
    }

    // 해당 세션의 측정 데이터들 가져오기
    const details = await postureService.getBySession(latestSession.session_id);

    res.status(200).json({
      session: latestSession,
      details: details
    });
  } catch (e) {
    console.error("최신 데이터 조회 에러:", e);
    next(e);
  }
};

module.exports = { 
  savePostureData, 
  getPostureBySession,
  saveBaseline,
  getLatest
};