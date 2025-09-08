import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import userModels from '../models/userModels.js';
import dotenv from "dotenv";
import GoogleStrategy from 'passport-google-oauth20';
// Environment variables check
console.log('Facebook App ID:', process.env.FACEBOOK_APP_ID ? 'Loaded' : 'Missing');
console.log('Facebook App Secret:', process.env.FACEBOOK_APP_SECRET ? 'Loaded' : 'Missing');
// configure env
dotenv.config();
// Facebook Strategy
passport.use(new FacebookStrategy.Strategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/api/v1/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name', 'displayName', 'photos']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Facebook profile received:', JSON.stringify({
      id: profile.id,
      displayName: profile.displayName,
      emails: profile.emails,
      photos: profile.photos,
      name: profile.name
    }, null, 2));
    
    // Check if user already exists with this facebookId
    let user = await userModels.findOne({ facebookId: profile.id });
    
    if (user) {
      console.log('Existing user found with facebookId:', user.email);
      return done(null, user);
    }
    
    // Safely handle email - check if emails array exists and has at least one email
    let userEmail = '';
    if (profile.emails && Array.isArray(profile.emails) && profile.emails.length > 0 && profile.emails[0].value) {
      userEmail = profile.emails[0].value;
      console.log('Email from Facebook:', userEmail);
      
      // Check if user exists with the same email
      user = await userModels.findOne({ email: userEmail });
      
      if (user) {
        console.log('Existing user found with email:', userEmail);
        // Link Facebook account to existing user
        user.facebookId = profile.id;
        user.loginMethod = 'facebook';
        
        // Safely handle profile photo
        if (profile.photos && Array.isArray(profile.photos) && profile.photos.length > 0 && profile.photos[0].value) {
          user.avatar = profile.photos[0].value;
        }
        
        await user.save();
        return done(null, user);
      }
    } else {
      // If no email provided by Facebook, create a placeholder email
      userEmail = `${profile.id}@facebook.com`;
      console.log('No email provided by Facebook, using placeholder:', userEmail);
    }
    
    // Safely handle name
    let userName = profile.displayName;
    if (!userName && profile.name) {
      userName = `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim();
    }
    if (!userName) {
      userName = `Facebook User ${profile.id.substr(0, 8)}`;
    }
    
    // Create new user
    user = new userModels({
      facebookId: profile.id,
      name: userName,
      email: userEmail,
      loginMethod: 'facebook',
      // Set default values for required fields
      phone: 'Not provided',
      address: { 
        street: 'Not provided',
        city: 'Not provided',
        state: 'Not provided',
        zipCode: 'Not provided',
        country: 'Not provided'
      },
      answer: 'facebook_login'
    });
    
    // Safely handle profile photo
    if (profile.photos && Array.isArray(profile.photos) && profile.photos.length > 0 && profile.photos[0].value) {
      user.avatar = profile.photos[0].value;
      console.log('Profile photo found:', user.avatar);
    }
    
    await user.save();
    console.log('New user created with Facebook login:', user.email);
    done(null, user);
    
  } catch (error) {
    console.error('Facebook authentication error:', error);
    done(error, null);
  }
}));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModels.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
passport.use(new GoogleStrategy.Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/v1/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google profile received:', JSON.stringify({
      id: profile.id,
      displayName: profile.displayName,
      emails: profile.emails,
      photos: profile.photos
    }, null, 2));

    // Check if user already exists with googleId
    let user = await userModels.findOne({ googleId: profile.id });
    if (user) {
      return done(null, user);
    }

    // Get email safely
    let userEmail = '';
    if (profile.emails && profile.emails.length > 0) {
      userEmail = profile.emails[0].value;
    } else {
      userEmail = `${profile.id}@google.com`;
    }

    // Check if user exists with same email
    user = await userModels.findOne({ email: userEmail });
    if (user) {
      user.googleId = profile.id;
      user.loginMethod = 'google';
      if (profile.photos && profile.photos.length > 0) {
        user.avatar = profile.photos[0].value;
      }
      await user.save();
      return done(null, user);
    }

    // Create new user
    const newUser = new userModels({
      googleId: profile.id,
      name: profile.displayName || "Google User",
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
      avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined
    });

    await newUser.save();
    return done(null, newUser);

  } catch (error) {
    console.error('Google authentication error:', error);
    done(error, null);
  }
}));
export default passport;