const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const passport = require('../config/passport')
const { sign } = require('../config/jwt')

// 일반 로그인/회원가입
router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/social', authController.social)

// 구글 로그인
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=failed' }),
  (req, res) => {
    // 로그인 성공 → JWT 발급 후 프론트로 전달
    const token = sign({ user_id: req.user.user_id, login_id: req.user.login_id })
    res.redirect(`http://localhost:5173/mypage?token=${token}`)
  }
)

// 카카오 로그인
router.get('/kakao',
  passport.authenticate('kakao')
)
router.get('/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: 'http://localhost:5173/login?error=failed' }),
  (req, res) => {
    const token = sign({ user_id: req.user.user_id, login_id: req.user.login_id })
    res.redirect(`http://localhost:5173/mypage?token=${token}`)
  }
)

module.exports = router
