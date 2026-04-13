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

module.exports = { getWeekly, getMonthly };