var passport = require('passport')
  , util = require('util')
  , User = require('../models/user')
  , bcrypt = require('bcrypt-nodejs')
  , List = require('../modules/list')
  , moment = require('moment')
  , LocalStrategy = require('passport-local').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , CurrentUser;



// Serialize and Deserialize User ID into Sessions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  if (CurrentUser && moment(CurrentUser.last_active).add(1, 'hour').isAfter(moment(), 'hour')) {
    if (!CurrentUser.touched() && CurrentUser.id === id) { 
      return done(null, CurrentUser) 
    };
  }

  User.findBy('id', id, function(err, user){
    CurrentUser = user;
    // Ensure only updated user will require a new DB request.
    if (CurrentUser.touched()) { CurrentUser.untouch() };
    return done(null, CurrentUser);
  });
});

passport.use(new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'email' 
  },
  function(req, email, password, done) {
    process.nextTick(function () {
      User.findBy('email', email, function(err, user) {
        if (err) { return done(null, false, { message: 'Unknown user ' + email }); }
        if (!bcrypt.compareSync(password, user.password)) { return done(null, false, { message: 'Invalid password' }); }
        user.updateActive();
        return done(null, user);
      });
    });
  }
));

 
passport.use(new FacebookStrategy({
    clientID: 1017381721660352,
    clientSecret: 'de60e205b5c23f65e0b1e2d2e43ca749',
    callbackURL: "/account/auth/facebook/callback",
    scope: ['public_profile', 'email'],
    profileFields: ['id', 'displayName', 'email', 'photos']
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      User.findBy('facebook_id', profile.id, function(err, user) {
        if (!err && user) { 
          user.updateActive();
          return done(null, user) 
        };

        User.createFacebook(profile._json, function(err, user) {
          if (err) { return done(null, false,  { message: err.constraint.replace(/_/g," ") }) };
          List.subscribe(user.email, user.username);
          return done(null, user);
        })
      });
    });
  }
));

passport.use(new GoogleStrategy({
    clientID: '999771109142-83di2tag0cegd42s36iu220g796gt510.apps.googleusercontent.com',
    clientSecret: 'mhAp9WN04LqAJ7ojogPAsm24',
    callbackURL: 'http://127.0.0.1:3000/account/auth/google/callback'
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function () {
      User.findBy('google_id', profile.id, function(err, user) {
        if (!err && user) { 
          user.updateActive();
          return done(null, user) 
        };

        User.createGoogle(profile._json, function(err, user) {
          if (err) { return done(null, false,  { message: err.constraint.replace(/_/g," ") }) };
          List.subscribe(user.email, user.username);
          return done(null, user);
        });
      });
    });
  }
));

