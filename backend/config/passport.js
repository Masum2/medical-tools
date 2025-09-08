import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import GoogleStrategy from 'passport-google-oauth20';
import dotenv from "dotenv";
import userModels from '../models/userModels.js';

// Load environment variables
dotenv.config();

const isProduction = process.env.NODE_MODE === "production";

// Helper function: get full callback URL
const getCallbackURL = (provider) => {
  if (provider === "facebook") {
    return isProduction
      ? "https://medical-tools.onrender.com/api/v1/auth/facebook/callback"
      : "http://localhost:8080/api/v1/auth/facebook/callback";
  } else if (provider === "google") {
    return isProduction
      ? "https://medical-tools.onrender.com/api/v1/auth/google/callback"
      : "http://localhost:8080/api/v1/auth/google/callback";
  }
};

// --------------------- FACEBOOK ---------------------
passport.use(
  new FacebookStrategy.Strategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: getCallbackURL("facebook"),
      profileFields: ['id', 'emails', 'name', 'displayName', 'photos']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userModels.findOne({ facebookId: profile.id });
        let userEmail = (profile.emails && profile.emails[0]?.value) || `${profile.id}@facebook.com`;

        if (!user) {
          // Check existing user by email
          user = await userModels.findOne({ email: userEmail });
          if (user) {
            user.facebookId = profile.id;
            user.loginMethod = 'facebook';
            if (profile.photos?.length) user.avatar = profile.photos[0].value;
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = new userModels({
            facebookId: profile.id,
            name: profile.displayName || `Facebook User ${profile.id.substr(0, 8)}`,
            email: userEmail,
            loginMethod: 'facebook',
            phone: 'Not provided',
            address: {
              street: 'Not provided',
              city: 'Not provided',
              state: 'Not provided',
              zipCode: 'Not provided',
              country: 'Not provided'
            },
            answer: 'facebook_login',
            avatar: profile.photos?.[0]?.value
          });
          await user.save();
        }
        done(null, user);
      } catch (error) {
        console.error('Facebook authentication error:', error);
        done(error, null);
      }
    }
  )
);

// --------------------- GOOGLE ---------------------
passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: getCallbackURL("google")
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userModels.findOne({ googleId: profile.id });
        let userEmail = (profile.emails && profile.emails[0]?.value) || `${profile.id}@google.com`;

        if (!user) {
          // Check existing user by email
          user = await userModels.findOne({ email: userEmail });
          if (user) {
            user.googleId = profile.id;
            user.loginMethod = 'google';
            if (profile.photos?.length) user.avatar = profile.photos[0].value;
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = new userModels({
            googleId: profile.id,
            name: profile.displayName || `Google User ${profile.id.substr(0, 8)}`,
            email: userEmail,
            loginMethod: 'google',
            phone: 'Not provided',
            address: {
              street: 'Not provided',
              city: 'Not provided',
              state: 'Not provided',
              zipCode: 'Not provided',
              country: 'Not provided'
            },
            answer: 'google_login',
            avatar: profile.photos?.[0]?.value
          });
          await user.save();
        }
        done(null, user);
      } catch (error) {
        console.error('Google authentication error:', error);
        done(error, null);
      }
    }
  )
);

// --------------------- SERIALIZE / DESERIALIZE ---------------------
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModels.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
