var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , https = require('https');

  // Insight API
var Insight_API_KEY = process.env.INSIGHT_KEY;


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
  res.render('index', { 
    title: 'Designed for Result',  
    path: req.originalUrl, 
    isMobile: h.is_mobile(req) 
  });
});


router.get('/getanswers', function (req, res, next) {
  res.render('contact', { 
    title: h.titleHelper('Get Answers'),  
    path: req.originalUrl, 
    isMobile: h.is_mobile(req)
  });
});

router.get('/test', function (req, res, next) {
  res.render('test', { 
    title: h.titleHelper('Test'),  
    path: req.originalUrl, 
    isMobile: h.is_mobile(req)
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
      r.on('data', function(chunk) {
         result += chunk;
      });
      
      r.on('end', function(){
        result = JSON.parse(result);

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
          isMobile: h.is_mobile(req) 
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
Disallow: /lp/*\n\
Disallow: /test\n\
Disallow: /admin/*");
});


/* Legal Pages */

router.get('/terms', function(req, res) {
  res.render('terms', { 
    title: h.titleHelper('Terms & Conditions'),  
    path: req.originalUrl, 
    isMobile: h.is_mobile(req)
  });
});

router.get('/privacy', function(req, res) {
  res.render('privacy', { 
    title:  h.titleHelper('Privacy Policy'),  
    path: req.originalUrl, 
    isMobile: h.is_mobile(req)
  });
});


module.exports = router;