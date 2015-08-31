var express = require('express')
  , h = require('../modules/application_helpers')
  , router = express.Router()
  , User = require('../models/user')
  , passport = require('passport');

// Register Admin
router.get('/register', function (req, res, next) {
  var message = req.flash('error');
  res.render('users/register', { 
    title: h.titleHelper('Register'),  
    path: req.path, 
    isMobile: h.is_mobile(req), 
    message: message
  });
});

router.post('/register', function (req, res, next) {
  User.create(req.body.admin, null, function(user) {
    res.redirect('/');
  });
});

// Login page
router.get('/login', function (req, res, next) {
  var message = req.flash('error');
    res.render('users/login', { 
    title: h.titleHelper('Login'),  
    path: req.path, 
    isMobile: h.is_mobile(req), 
    message: message
  });
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/campaign/surveys');
    });
  })(req, res, next);
});

// Logout

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


module.exports = router;
