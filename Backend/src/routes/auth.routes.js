const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.login); 
router.post('/register', authController.register);
router.post('/social', authController.social);

module.exports = router;

const passport = require('passport');

// ✅ 구글 로그인
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // 로그인 성공 → 프론트로 리다이렉트
    res.redirect(`${process.env.CLIENT_URL}/mypage`);
  }
);

// ✅ 카카오 로그인
router.get('/kakao',
  passport.authenticate('kakao')
);

router.get('/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/mypage`);
  }
);