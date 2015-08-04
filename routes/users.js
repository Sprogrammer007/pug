var express = require('express')
  , h = require('../modules/application_helpers')
  , router = express.Router();

/* GET users listing. */

// Login

router.get('/dashboard', function(req, res, next) {
  res.render('users/dashboard', { 
    title: h.titleHelper('Log In'),  
    path: req.originalUrl, 
    isMobile: h.is_mobile(req)
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', { 
    title: h.titleHelper('Log In'),  
    path: req.originalUrl, 
    isMobile: h.is_mobile(req)
  });
});


module.exports = router;
