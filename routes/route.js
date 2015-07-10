var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , stripe = require("stripe")(process.env.STRIPE_KEY)
  , MCID = process.env.MC_ID
  , https = require('https')
  , dbManager = require('../modules/database-manager');


// Insight API
var Insight_API_KEY = process.env.INSIGHT_KEY;

function is_mobile(req) {
  var ua = req.header('user-agent');
  if( ua.match(/Android/i)
   || ua.match(/webOS/i)
   || ua.match(/iPhone/i)
   || ua.match(/iPad/i)
   || ua.match(/iPod/i)
   || ua.match(/BlackBerry/i)
   || ua.match(/Windows Phone/i)
   || ua.match(/Mobile/i)
   || ua.match(/Kindle/i)
   || ua.match(/Opera Mobi/i)
   ){
    return true;
  }
  else {
    return false;
  }
}

function extractFormats(formats, type) {
  var a = [];
  for(var i in formats) {


    if (type === 'errors' && formats[i].ruleImpact >= 10) {
      a.push(formats[i]);
    } else if (type === 'passed' && formats[i].ruleImpact === 0 ) {
      a.push(formats[i]);
    } else if (type === 'warnings' && formats[i].ruleImpact < 10 && formats[i].ruleImpact > 0 ) {
      a.push(formats[i]);
    }
  }
  return a;
}




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Designed for Result',  path: req.originalUrl, isMobile: is_mobile(req) });
});


router.get('/getanswers', function (req, res, next) {
  res.render('contact', { title: h.titleHelper('Get Answers'),  path: req.originalUrl, isMobile: is_mobile(req)});
});

router.get('/test', function (req, res, next) {
  res.render('test', { title: h.titleHelper('Test'),  path: req.originalUrl, isMobile: is_mobile(req)});
});




/* Subscribe Mailchimp */
router.post('/subscribe', function (req, res, next) {

  var email = req.body.email;
  var mcReq = {
    id: MCID,
    email: { email: email },
    merge_vars: {
      EMAIL: email,
      FNAME: req.body.name
    },
    email_type: 'html',
    double_optin: false,
    update_existing: false,
    replace_interests: true,
    send_welcome: true
  };

  

  mc.lists.subscribe(mcReq, function(data) {
    console.log('User subscribed successfully! Look for the confirmation email.');
    dbManager.createUser(req);
    res.redirect('/lp/tp/v1');
  },
  function(error) {
    if (error.error) {
      console.log(error.code + ": " + error.error);
    } else {
      console.log('There was an error subscribing that user');
    }
    res.redirect('/');
  });

  
});

// SpeedTest

router.post('/speedtest/report', function(req, res, next ){
  var url = req.body.protocal + req.body.url;
  var result = '',
      score = 0,
      screenshot = ''
      mime = '',
      errors = [],
      warnings = [],
      passed = [];

  https.get({
    host: 'www.googleapis.com', 
    path: '/pagespeedonline/v2/runPagespeed?url=' + encodeURIComponent(url) + 
          '&screenshot=true&key='+Insight_API_KEY+'&strategy=desktop'
    }, function(r) {
      console.log("statusCode: ", res.statusCode);
      r.on('data', function(chunk) {
         result += chunk;
      });
      r.on('end', function(){
        result = JSON.parse(result);
        console.log(result)

        if (result.ruleGroups != undefined ) {
          score = result.ruleGroups.SPEED.score;
        }

        if (result.screenshot != undefined) {
          screenshot = result.screenshot.data.replace(/_/g, '/');
          screenshot = screenshot.replace(/-/g, '+');
          mime = result.screenshot.mime_type
        }

        if (result.formattedResults != undefined) {
          errors = extractFormats(result.formattedResults.ruleResults, 'errors');
          warnings = extractFormats(result.formattedResults.ruleResults, 'warnings');
          passed = extractFormats(result.formattedResults.ruleResults, 'passed');
        }

        res.render('report', { 
          title: 'Designed for Result | Speed Test Report', 
          path: req.originalUrl,
          url: url,
          score: score,
          mime_type: mime,
          screenshot: screenshot,
          isMobile: is_mobile(req) 
        });
      });
   
  }).on('error', function(e) {
    var errors = e.errors;
    for (var i = 0, len = errors.length; i < len; ++i) {
      if (errors[i].reason == 'badRequest' && API_KEY == Insight_API_KEY ) {
        console.log('Please specify your Google API key in the API_KEY variable.');
      } else {
        // NOTE: your real production app should use a better
        // mechanism than alert() to communicate the error to the user.
        console.log(errors[i].message);
      }
    }
  });
});

/* Post Sent Mail */
router.post('/contact_mailer', function (req, res, next) {
  req.app.mailer.send('/emails/lead', {
    to: 'stevey@bigtalkconsulting.com', // REQUIRED. This can be a comma delimited string just like a normal email to field. 
    subject: 'contact from ' + req.body.position, // REQUIRED.
    otherProperty: req.body // All additional properties are also passed to the template as local variables.
  }, function (err) {
    if (err) {
      // handle error
      console.log(err);
      return;
    }
    res.json({'success': "1"});
  });
});

/* Robot.txt */

router.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\n\
Disallow: /lp/guide\n\
Disallow: /guide\n\
Disallow: /test\n\
Disallow: /admin/*\n\
Disallow: /cc/thank-you\n\
Disallow: /wireframe/thank-you\n\
Disallow: /wireframe-discount");
});


/* Legal Pages */

router.get('/terms', function(req, res) {
  res.render('terms', { title: h.titleHelper('Terms & Conditions'),  path: req.originalUrl, isMobile: is_mobile(req)});
});

router.get('/privacy', function(req, res) {
  res.render('privacy', { title:  h.titleHelper('Privacy Policy'),  path: req.originalUrl, isMobile: is_mobile(req)});
});
module.exports = router;
