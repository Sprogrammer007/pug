var express = require('express')
  , h = require('../modules/application_helpers')
  , router = express.Router()
  , User = require('../models/user')
  , List = require('../modules/list')
  , pass = require('passport');


// Register Admin
router.get('/register', function (req, res, next) {
  ensureUnauth(req, res, next);
  var errors = prepareErrors(req.flash('error'));
  res.render('users/register', { 
    title: h.titleHelper('Register'),
    code: req.query.code,
    errors: errors
  });
});

router.post('/register', function (req, res, next) {
  ensureUnauth(req, res, next);
  User.create(req.body.user, null, req.body.service, function(err, user) {
    if (err) {
      req.flash('error', err.constraint.replace(/_/g," "));
      return res.redirect('/account/register')
    }
    
    res.mailer.send('emails/confirm_email', {
      to: user.email,
      subject: "Confirm Your Email",
      otherProperty: {user: user}
    }, function(err) {
      if (err) { return console.log (err) };
    });
    List.subscribe(user.email, user.username);
    res.redirect('/campaign/' + req.body.service + 's?code=' + req.params.code);
  });
});

// Login page
router.get('/login', function (req, res, next) {
  ensureUnauth(req, res, next);
  var errors = prepareErrors(req.flash('error'));
  var success = prepareErrors(req.flash('success'));

  res.render('users/login', { 
    title: h.titleHelper('Login'),
    errors: errors,
    success: success,
    k: req.query.k
  });
});

router.post('/login', function (req, res, next) {
  ensureUnauth(req, res, next);
  pass.authenticate('local', function(err, user, info) {
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/account/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      if (req.body.k) {
        return res.redirect('/account/confirmation?key=' + req.body.k);
      } 
      return res.redirect('/campaign/surveys');
    });
  })(req, res, next);
});

// Logout

router.get('/logout', function(req, res){
  if (req.isAuthenticated()) { 
    req.user.touch();
    req.logout();
    req.session.destroy(); 
  }
  return res.redirect('/');   
});

// Reset Password

router.get('/reset/password', function(req, res) {
  var token = req.query.token;
  var errors = prepareErrors(req.flash('error'))
  res.render('users/reset', { 
    title: h.titleHelper('Reset Password'),
    token: token,
    errors: errors
  });
});

router.post('/reset/password', function(req, res) {
  var token = req.body.token
  User.findBy('temp_pass_token', token, function(err, user) {
    if (err) {
      req.flash('error', "Invalid token");
      return res.redirect('/account/reset/password?token=' + token);
    } 
    user.resetPassword(token, req.body.password, function(err) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('/account/reset/password?token=' + token);
      } else {
        req.flash('success', "Password reset successful.");
        return res.redirect('/account/login')
      }
    })
  });
});

router.post('/generate/token', function(req, res) {
  User.findBy('email', req.body.email, function(err, user) {
    if (err) {
      return res.json({success: false, message: 'Could not find an account with that email.'})
    } else {
      user.generateResetToken(function(u) {
        if (err) { return res.json(h.errorMSG()) };
        res.mailer.send('emails/reset_password', {
          to: user.email,
          subject: "Instruction to Reset Your Password",
          otherProperty: {user: u}
        }, function(err) {
          if (err) { return res.json(h.errorMSG()) };
          res.json({success: true});
        });
      })
    }
  });
});


//Confirm Email

router.get('/confirmation', function(req, res) {
  if (req.user) {
    req.user.confirmEmail(req.query.key, function(err) {
      res.render('users/confirm', { 
        title: h.titleHelper('Email Confirmation'),
        error: err
      });
    });
  } else {
    req.flash('error', "Please login to confirm your email.");
    return res.redirect('/account/login?k=' + req.query.key);
  }
});

//Facebook
router.get('/auth/facebook', function(req, res, next) {
  pass.authenticate('facebook', 
    { 
      state: req.query.code
    }
  )(req, res, next);
});

router.get('/auth/facebook/callback', pass.authenticate('facebook', { failureRedirect: '/account/login', failureFlash: true }), function (req, res, next) {
  
  if (req.query.state) {
    return res.redirect('/campaign/surveys?code=' + req.query.state);
  }
  return res.redirect('/campaign/surveys');
});

//Google
router.get('/auth/google', function(req, res, next) {
  pass.authenticate('google',  
    { 
      scope: 'https://www.googleapis.com/auth/plus.profile.emails.read',
      state: req.query.code
    }
  )(req, res, next);

});

router.get('/auth/google/callback', pass.authenticate('google', { failureRedirect: '/account/login', failureFlash: true }), function (req, res, next) {

  if (req.query.state) {
    return res.redirect('/campaign/surveys?code=' + req.query.state);
  }
  return res.redirect('/campaign/surveys');
});

function prepareErrors(flash) {
  return (flash[0]) ? flash[0].split('/') : false;
}

function ensureUnauth(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/campaign/surveys')
  }
}
module.exports = router;
