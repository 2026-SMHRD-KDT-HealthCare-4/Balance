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
        provider_id: profile.id
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_CLIENT_ID,
  clientSecret: process.env.KAKAO_CLIENT_SECRET,
  callbackURL: process.env.KAKAO_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({
      where: { provider: 'kakao', provider_id: String(profile.id) }
    });
    if (!user) {
      user = await User.create({
        name: profile.displayName || profile.username,
        email: profile._json?.kakao_account?.email || `kakao_${profile.id}@rebalance.com`,
        login_id: `kakao_${profile.id}`,
        provider: 'kakao',
        provider_id: String(profile.id)
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;