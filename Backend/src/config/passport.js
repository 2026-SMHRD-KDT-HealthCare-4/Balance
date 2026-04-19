const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const { User } = require('../models');

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(new GoogleStrategy({ 
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({
      where: { provider: 'google', provider_id: profile.id }
    });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        login_id: `google_${profile.id}`,
        provider: 'google',
        provider_id: profile.id,
        age : 25
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 1. provider로 먼저 찾기
    let user = await User.findOne({
      where: { provider: 'google', provider_id: profile.id }
    });

    // 2. 없으면 이메일로 찾기 (다른 방식으로 가입한 경우)
    if (!user) {
      user = await User.findOne({
        where: { email: profile.emails[0].value }
      });
    }

    // 3. 둘 다 없을 때만 새로 생성
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        login_id: `google_${profile.id}`,
        provider: 'google',
        provider_id: profile.id,
        age: 25
      });
    }

    return done(null, user);
  } catch (err) {
    console.log('=== GOOGLE PASSPORT ERROR ===');
    console.log('message:', err.message);
    console.log('errors:', JSON.stringify(err.errors, null, 2));
    console.log('sql:', err.sql);
    console.log('=============================');
    return done(err);
  }
}));

module.exports = passport;