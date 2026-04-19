const postureService = require('../services/posture.service');
// 🌟 모델명을 index.js와 동일하게 'PostureData'로 수정했습니다.
const { User, StretchingLog, Session, PostureData } = require('../models'); 
const { Op } = require('sequelize');

/**
 * [1] 자세 데이터 저장 컨트롤러
 */
const savePostureData = async (req, res, next) => {
  try {
    // ✅ 이걸로 교체
    const { angle, score, status, type } = req.body;
    const numericAngle = parseFloat(angle) || 0;
    const user_id = req.user ? req.user.user_id : null;

    const latestSession = await postureService.getLatestSession(user_id);

    const dataToSave = {
      user_id: user_id,
      session_id: latestSession.session_id,
      neck_angle: type === 'side' ? numericAngle : 0,
      shoulder_angle: type === 'front' ? numericAngle : 0,
      alarm_message: status,
      posture_score: score ?? 0
    };

        const savedResult = await postureService.save(dataToSave);
        res.status(201).json(savedResult);
      } catch (e) {
        next(e);
      }
    };

/**
 * [2] 스트레칭 완료 로그 저장
 */
const saveStretchingLog = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    let latestSession = await postureService.getLatestSession(user_id);

    if (!latestSession) {
      latestSession = await Session.create({ user_id: user_id });
    }

    const newLog = await StretchingLog.create({
      session_id: latestSession.session_id,
      target_part: 'neck_shoulder',
      duration: 60,
      created_at: new Date()
    });

    res.status(201).json({ success: true, data: newLog });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

/**
 * [3] 세션별 자세 데이터 조회
 */
const getPostureBySession = async (req, res, next) => {
  try {
    const { session_id } = req.params;
    const result = await postureService.getBySession(session_id);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

/**
 * [4] 정자세 기준값 저장
 */
const saveBaseline = async (req, res, next) => {
  try {
    const { baseShoulderWidth, baseNeckDist, baseShoulderDiff } = req.body;
    await User.update({
      base_shoulder_width: baseShoulderWidth,
      base_neck_dist: baseNeckDist,
      base_shoulder_diff: baseShoulderDiff
    }, { where: { user_id: req.user.user_id } });
    res.status(200).json({ message: '기준값 저장 완료' });
  } catch (e) {
    next(e);
  }
};

/**
 * [5] 최신 자세 데이터 조회 (메인 페이지용)
 * 🌟 수정 포인트: PostureData 모델 사용 및 오늘 날짜 기반 집계
 */
const getLatest = async (req, res, next) => {
  try {
    const user_id = req.user.user_id;

    // 1. 유저 실제 나이
    const user = await User.findByPk(user_id);
    const actualAge = (user && user.age) ? Number(user.age) : 25;

    // 2. 오늘 날짜 범위
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 3. 오늘 저장된 자세 데이터 전체 조회
    const todayLogs = await PostureData.findAll({
      include: [{ model: Session, where: { user_id }, required: true }],
      where: {
        posture_measurement_time: { [Op.between]: [startOfToday, endOfToday] }
      },
      order: [['posture_id', 'ASC']]  // ✅ DESC → ASC (초기 측정값이 앞으로)
    });

    // 4. 가장 첫 세션(InitialSetup) 기준으로만 계산
    const logs = todayLogs.map(l => l.dataValues || l);

    // ✅ 첫 번째 세션 ID 추출
    const initialSessionId = logs[0]?.session_id;

    // ✅ 초기 세션 로그만 필터링
    const initialLogs = logs.filter(l => l.session_id === initialSessionId);

    const frontLog = initialLogs.find(l => l.shoulder_angle > 0);
    const sideLog  = initialLogs.find(l => l.neck_angle > 0);

    let latestScore = 0;
    if (frontLog && sideLog) {
      latestScore = Math.floor((frontLog.posture_score + sideLog.posture_score) / 2);
    } else if (frontLog || sideLog) {
      latestScore = (frontLog || sideLog).posture_score;
    }
    latestScore = Math.min(latestScore, 97);

    // 5. 오늘 스트레칭 횟수
    const stretchCount = await StretchingLog.count({
      include: [{ model: Session, where: { user_id }, required: true }],
      where: {
        created_at: { [Op.between]: [startOfToday, endOfToday] }
      }
    });

    // 6. 목 나이 계산
    const agePenalty = latestScore === 0 ? 0 : Math.round((97 - latestScore) / 97 * 20);
    const neckAge = actualAge + agePenalty;

    res.status(200).json({
      posture_score: latestScore,
      neck_age: neckAge,
      stretch_count: stretchCount
    });

  } catch (e) {
    console.error("최신 데이터 조회 에러:", e);
    res.status(200).json({
      posture_score: 0,   // ✅ 100 → 0
      neck_age: 25,
      stretch_count: 0
    });
  }
};

module.exports = {
  savePostureData,
  saveStretchingLog,
  getPostureBySession,
  saveBaseline,
  getLatest
};