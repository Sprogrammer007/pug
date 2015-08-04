var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , User = require('../../models/user')
  , passport = require('passport');

// DashBoard

router.get('/', function (req, res, next) {
  if (req.user && req.user.role === "Admin") {
    return res.redirect('/admin/posts');  
  } else {
    req.flash('error', "please login!");
    return res.redirect('/admin/login');  
  }
});

router.get('/dashboard', function (req, res, next) {
    console.log(req.user)
  if (req.user && req.user.role === "Admin") {
    console.log('teste')
    return res.render('admin/dashboard', {
       title: h.titleHelper('Dashboard'),
       path: req.path,
       isMobile: h.is_mobile(req)
    });
  } else {
    req.flash('error', "please login!");
    return res.redirect('/admin/login');  
  }
});


// Register Admin
router.get('/register', function (req, res, next) {
  var message = req.flash('error');
  res.render('admin/register', { 
    title: h.titleHelper('Register'),  
    path: req.path, 
    isMobile: h.is_mobile(req), 
    message: message
  });
});

router.post('/register', function (req, res, next) {
  User.create(req.body.admin, 'admin');
  res.redirect('/admin/login');
});

// Login page
router.get('/login', function (req, res, next) {
  var message = req.flash('error');
    res.render('admin/login', { 
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
      return res.redirect('/admin/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/admin/dashboard');
    });
  })(req, res, next);
});

// Logout

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


module.exports = router;
