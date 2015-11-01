var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , https = require('https');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Pug Squad'
  });
});


router.get('/help', function (req, res, next) {
  res.render('help', { 
    title: h.titleHelper('Help')
  });
});


/* Contact */
router.post('/contact_mailer', function (req, res, next) {
  res.mailer.send('emails/lead', {
    to: 'stevey@bigtalkconsulting.com',
    subject: 'contact from ' + req.body.position,
    otherProperty: req.body
  }, function (err) {
    if (err) { return res.json(h.errorMSG()) };
    res.json({'success': "1"});
  });
});

/* Legal Pages */

router.get('/terms', function(req, res) {
  res.render('terms', { 
    title: h.titleHelper('Terms & Conditions')
  });
});

router.get('/privacy', function(req, res) {
  res.render('privacy', { 
    title:  h.titleHelper('Privacy Policy')
  });
});

/* Robot.txt */

router.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\n\
Disallow: /lp/*\n\
Disallow: /test\n\
Disallow: /campaign/*\n\
Disallow: /api/*");
});


module.exports = router;