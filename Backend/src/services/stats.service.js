const { PostureData, Session, AiReport, sequelize } = require('../models');
const { Op, fn, col } = require('sequelize');

// 1. 주간 통계 (기존 로직 유지)
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

// 2. 🔥 최근 분석 리포트 가져오기 (추가)
const getLatestReport = async (user_id) => {
  return await AiReport.findOne({
    where: { user_id },
    order: [['created_at', 'DESC']], // 가장 최근 리포트 1개
    raw: true
  });
};

// 3. 🔥 잔디 데이터 (날짜별 활동량) 가져오기 (추가)
const getUsageGrass = async (user_id) => {
  // 최근 30일간 일자별 세션 횟수 계산
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