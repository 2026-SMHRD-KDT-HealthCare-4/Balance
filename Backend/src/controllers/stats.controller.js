// src/controllers/stats.controller.js
const statsService = require('../services/stats.service');

const getWeekly = async (req, res, next) => {
  try {
    const result = await statsService.getWeekly(req.user.user_id);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const getMonthly = async (req, res, next) => {
  try {
    // 현재 서비스에 getMonthly가 구현되어 있지 않다면 임시 메시지 응답
    res.status(200).json({ message: "월간 통계 기능 준비 중" });
  } catch (e) {
    next(e);
  }
};

// 🔥 추가된 함수 1: 최근 리포트 가져오기
const getLatestReport = async (req, res, next) => {
  try {
    const result = await statsService.getLatestReport(req.user.user_id);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

// 🔥 추가된 함수 2: 잔디 데이터(활동량) 가져오기
const getUsageGrass = async (req, res, next) => {
  try {
    const result = await statsService.getUsageGrass(req.user.user_id);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

// ✅ 반드시 내보내는 객체에 새로 만든 함수들을 포함시켜야 합니다!
module.exports = { 
  getWeekly, 
  getMonthly, 
  getLatestReport, 
  getUsageGrass 
};
