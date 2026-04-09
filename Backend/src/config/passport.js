const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const KakaoStrategy = require('passport-kakao').Strategy
const { User } = require('../models')

passport.serializeUser((user, done) => {
  done(null, user.user_id)
})

passport.deserializeUser(async (user_id, done) => {
  try {
    const user = await User.findByPk(user_id)
    done(null, user)
  } catch (err) {
    done(err)
  }
})

// 공통 소셜 유저 저장 로직
const saveUser = async (provider, profile, done) => {
  try {
    const provider_id = String(profile.id)
    const name = profile.displayName || 'Unknown'
    let email = null

    if (profile.emails && profile.emails[0]) {
      email = profile.emails[0].value
    } else if (profile._json?.kakao_account) {
      email = profile._json.kakao_account.email
    }

    let user = await User.findOne({ where: { provider, provider_id } })

    if (!user) {
      user = await User.create({
        login_id: `${provider}_${provider_id}`,
        name,
        email: email || `${provider}_${provider_id}@rebalance.com`,
        provider,
        provider_id,
        password: null
      })
    }

    return done(null, user)
  } catch (err) {
    return done(err)
  }
}

// 구글 전략
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, (accessToken, refreshToken, profile, done) =>
  saveUser('google', profile, done)
))

// 카카오 전략
passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  callbackURL: '/api/auth/kakao/callback'
}, (accessToken, refreshToken, profile, done) =>
  saveUser('kakao', profile, done)
))

module.exports = passport