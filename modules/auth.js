var passport = require('passport')
  , util = require('util')
  , flash = require('connect-flash')
  , User = require('../models/user')
  , bcrypt = require('bcrypt-nodejs')
  , LocalStrategy = require('passport-local').Strategy;

// Serialize and Deserialize User ID into Sessions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findBy('id', id, function(user){
    return done(null, user)
  });

});

passport.use(new LocalStrategy({passReqToCallback: true },
  function(req, username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      User.findBy('username', username, function(user) {
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (!bcrypt.compareSync(password, user.password)) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      });
    });
  }
));


// AuthObject

var auth = {
  authenticated: function() {
    return passport.authenticate('local', { failureRedirect: '/login', failureFlash: true });
  }
}



module.exports = auth;