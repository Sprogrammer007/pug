var passport = require('passport')
  , util = require('util')
  , flash = require('connect-flash')
  , dbManager = require('./database-manager')
  , bcrypt = require('bcrypt-nodejs')
  , LocalStrategy = require('passport-local').Strategy;

// Serialize and Deserialize User ID into Sessions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  dbManager.findById('users', id, function (err, user) {
    done(err, user[0]);
  });
});

passport.use(new LocalStrategy({passReqToCallback: true },
  function(req, username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
 
      dbManager.findBy('users', 'username', username, function(err, user) {
        if (err) { return done(err); }
        if (!user[0]) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (!bcrypt.compareSync(password, user[0].password)) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user[0]);
      })
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