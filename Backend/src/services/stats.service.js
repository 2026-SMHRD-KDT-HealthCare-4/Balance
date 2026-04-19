const { PostureData, Session, AiReport, sequelize } = require('../models');
const { Op, fn, col } = require('sequelize');

// 1. 주간 통계
const getWeekly = async (user_id) => {
  const from = new Date();
  from.setDate(from.getDate() - 7);

  const sessions = await Session.findAll({
    where: { user_id, start_time: { [Op.gte]: from } },
    attributes: ['session_id']
  });
  
  if (sessions.length === 0) return { avg_neck_angle: 0, avg_posture_score: 0, total_records: 0 };

  const sessionIds = sessions.map(s => s.session_id);

  return await PostureData.findOne({
    where: { session_id: { [Op.in]: sessionIds } },
    attributes: [
      [fn('AVG', col('neck_angle')), 'avg_neck_angle'],
      [fn('AVG', col('posture_score')), 'avg_posture_score'],
      [fn('COUNT', col('posture_id')), 'total_records']
    ],
    raw: true
  });
};

const generatePrescription = (stats) => {
  // ✅ 4개 항목 기준으로 변경
  const avg = Math.round(
    Object.values(stats).reduce((a, b) => a + b, 0) / 4
  );

  let summary = '';
  let tip = '';

  if (avg >= 80) {
    summary = '이번 주 자세가 매우 좋았어요! 꾸준히 유지해보세요.';
    tip = '현재 자세를 유지하면서 스트레칭도 병행해보세요.';
  } else if (avg >= 60) {
    summary = '자세가 양호한 편이에요. 조금만 더 신경써봐요!';
    tip = '틈틈이 어깨와 목 스트레칭을 해주세요.';
  } else if (avg >= 40) {
    summary = '자세가 다소 불안정해요. 의식적으로 교정이 필요해요.';
    tip = '1시간마다 자리에서 일어나 스트레칭을 해주세요.';
  } else {
    summary = '자세 교정이 많이 필요한 상태예요. 함께 개선해봐요!';
    tip = '거북목과 어깨 균형 운동을 매일 꾸준히 해주세요.';
  }

  return { summary, tip };
};

// 2. 최근 분석 리포트 가져오기
const getLatestReport = async (user_id) => {
  const from = new Date();
  from.setDate(from.getDate() - 7);

  const sessions = await Session.findAll({
    where: { user_id, start_time: { [Op.gte]: from } },
    attributes: ['session_id'],
    raw: true
  });

  let postureStats = {
    balance_shoulder: 0,
    balance_neck: 0,
    balance_head: 0,       // 자세 점수로 사용
    compliance_score: 0,
    // ✅ accuracy_score 제거
  };

  if (sessions.length > 0) {
    const sessionIds = sessions.map(s => s.session_id);

    const raw = await PostureData.findAll({
      where: { session_id: { [Op.in]: sessionIds } },
      attributes: [
        [fn('AVG', col('shoulder_angle')), 'avg_shoulder'],
        [fn('AVG', col('neck_angle')),     'avg_neck'],
        [fn('AVG', col('posture_score')),  'avg_score'],
        [fn('COUNT', col('posture_id')),   'total_count'],
      ],
      raw: true
    });

    const result = raw[0];

    if (result && result.total_count > 0) {
      const avgShoulder = result.avg_shoulder ?? 0;
      const avgNeck = result.avg_neck ?? 0;
      const avgScore = result.avg_score ?? 0;

      const SHOULDER_NORMAL_MAX = 5;
      const NECK_NORMAL_MAX = 7;
      const shoulderScore = Math.max(0, Math.round((1 - Math.abs(avgShoulder) / SHOULDER_NORMAL_MAX) * 100));
      const neckScore = Math.max(0, Math.round((1 - avgNeck / NECK_NORMAL_MAX) * 100));

      postureStats = {
        balance_shoulder: shoulderScore,
        balance_neck:     neckScore,
        balance_head:     Math.round(avgScore), // 자세 점수
        compliance_score: Math.min(100, Math.round((sessions.length / 7) * 100)),
        // ✅ accuracy_score 제거
      };
    }
  }

  // 처방전 텍스트 생성
  const { summary, tip } = generatePrescription(postureStats);
  // ✅ 4개 항목 기준으로 변경
  const score = Math.round(
    Object.values(postureStats).reduce((a, b) => a + b, 0) / 4
  );

  // 기존 리포트 업데이트 or 새로 생성
  const report = await AiReport.findOne({
    where: { user_id },
    order: [['created_at', 'DESC']],
  });

  if (report) {
    await report.update({
      ...postureStats,
      report_text: summary,
      prescription_text: tip,
      score,
    });
    return report.get({ plain: true });
  }

  const newReport = await AiReport.create({
    user_id,
    posture_id: null,
    ...postureStats,
    report_text: summary,
    prescription_text: tip,
    score,
    report_type: 'daily',
  });
  return newReport.get({ plain: true });
};

// 3. 잔디 데이터 (날짜별 활동량)
const getUsageGrass = async (user_id) => {
  const from = new Date();
  from.setDate(from.getDate() - 30);

  return await Session.findAll({
    where: { 
      user_id, 
      start_time: { [Op.gte]: from } 
    },
    attributes: [
      [fn('DATE', col('start_time')), 'date'],
      [fn('COUNT', col('session_id')), 'count']
    ],
    group: [fn('DATE', col('start_time'))],
    order: [[fn('DATE', col('start_time')), 'ASC']],
    raw: true
  });
};

module.exports = { 
  getWeekly, 
  getLatestReport, 
  getUsageGrass 
};