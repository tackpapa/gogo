const _ = require('lodash');
const passport = require('passport');
const request = require('request');
const InstagramStrategy = require('passport-instagram').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const OpenIDStrategy = require('passport-openid').Strategy;
const OAuthStrategy = require('passport-oauth').OAuthStrategy;
// const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  });
}));

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['name', 'email', 'link', 'locale', 'timezone'],
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  console.log(profile)
  if (req.user) {
    User.findOne({ facebook: profile.id }, (err, existingUser) => {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {
          console.log(req.user.id+"SSSSSSS")
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken });
          user.profile.name = user.profile.name || profile.name.givenName + ' ' + profile.name.familyName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
          console.log("loggininfbbbbbbb")
          user.save((err) => {
            req.flash('info', { msg: 'Facebook account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    console.log("yogigigigi")
    User.findOne({ facebook: profile.id }, (err, existingUser) => {
      if (existingUser) {
         done(err);
      }
          console.log("sipal")
          const user = new User();
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken });
          user.profile.name = profile.name.givenName + ' ' + profile.name.familyName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          console.log(user)
          user.save((err) => {
            done(err, user);

          });
        

    });
  }
}));

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: '/auth/twitter/callback',
  passReqToCallback: true
}, (req, accessToken, tokenSecret, profile, done) => {
  if (req.user) {
    User.findOne({ twitter: profile.id }, (err, existingUser) => {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {
          user.twitter = profile.id;
          user.tokens.push({ kind: 'twitter', accessToken, tokenSecret });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.location = user.profile.location || profile._json.location;
          user.profile.picture = user.profile.picture || profile._json.profile_image_url_https;
          user.save((err) => {
            req.flash('info', { msg: 'Twitter account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ twitter: profile.id }, (err, existingUser) => {
      if (existingUser) {
        return done(null, existingUser);
      }
      const user = new User();
      // Twitter will not provide an email address.  Period.
      // But a person’s twitter username is guaranteed to be unique
      // so we can "fake" a twitter email address as follows:
      user.email = `${profile.username}@twitter.com`;
      user.twitter = profile.id;
      user.tokens.push({ kind: 'twitter', accessToken, tokenSecret });
      user.profile.name = profile.displayName;
      user.profile.location = profile._json.location;
      user.profile.picture = profile._json.profile_image_url_https;
      user.save((err) => {
        done(err, user);
      });
    });
  }
}));

/**
 * Sign in with Google.
 */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: '/auth/google/callback',
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    User.findOne({ google: profile.id }, (err, existingUser) => {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || profile._json.image.url;
          user.save((err) => {
            req.flash('info', { msg: 'Google account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ google: profile.id }, (err, existingUser) => {
      if (existingUser) {
        return done(null, existingUser);
      }
      User.findOne({ email: profile.emails[0].value }, (err, existingEmailUser) => {
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.' });
          done(err);
        } else {
          const user = new User();
          user.email = profile.emails[0].value;
          user.google = profile.id;
          user.tokens.push({ kind: 'google', accessToken });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = profile._json.image.url;
          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
}));
/**
 * Sign in with Instagram.
 */
passport.use(new InstagramStrategy({
  clientID: process.env.INSTAGRAM_ID,
  clientSecret: process.env.INSTAGRAM_SECRET,
  scope: 'public_content',
  callbackURL: '/auth/instagram/callback',
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    User.findOne({ instagram: profile.id }, (err, existingUser) => {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already an Instagram account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {
          user.instagram = profile.id;
          user.tokens.push({ kind: 'instagram', accessToken });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.picture = user.profile.picture || profile._json.data.profile_picture;
          user.profile.website = user.profile.website || profile._json.data.website;
          user.save((err) => {
            req.flash('info', { msg: 'Instagram account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ instagram: profile.id }, (err, existingUser) => {
      if (existingUser) {
        return done(null, existingUser);
      }
      const user = new User();
      user.instagram = profile.id;
      user.tokens.push({ kind: 'instagram', accessToken });
      user.profile.name = profile.displayName;
      // Similar to Twitter API, assigns a temporary e-mail address
      // to get on with the registration process. It can be changed later
      // to a valid e-mail address in Profile Management.
      user.email = `${profile.username}@instagram.com`;
      user.profile.website = profile._json.data.website;
      user.profile.picture = profile._json.data.profile_picture;
      user.save((err) => {
        done(err, user);
      });
    });
  }
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/`);
  }
};
