var express = require('express');
var router = express.Router();
var stripe = require("stripe")(process.env.STRIPE_KEY);
// var stripe = require("stripe")('sk_test_0H0Rdb9qLzLzHEdMdjPMGtoh');
var MCID = process.env.MC_ID;
var https = require('https');
var dbManager = require('../modules/database-manager');

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


router.post('/checkout', function (req, res, next) {
  console.log(req.body)
  var token = req.body.stripeToken;
  var user = dbManager.getUserByEmail(req.body.email);
  var order = null;
  if (user === undefined ) {
    user = dbManager.createUser(req);
  } else {
    dbManager.updateUser(req, user.id)
  }


  stripe.customers.create({
    source: token,
    email: req.body.email,
    description: 'waiting for approvel for product '
  }).then(function(customer) {
    console.log(customer);
    order = dbManager.createOrder(req, user.id, customer.id, token);
    res.redirect('/wireframe/thank-you/' + order.id);
  });
 
});

router.post('/ckc', function (req, res, next) {
  var userParams = {};
  userParams.body = {};
  userParams.body.email = req.body.email;
  userParams.body.name = req.body.name;
  userParams.body.address = req.body.address;
  userParams.body.city = req.body.city;
  userParams.body.postal = req.body.postal;
  userParams.body.phone = req.body.phone;
  userParams.body.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var orderParams = {};
  orderParams.body = {};
  orderParams.body.product_name = req.body.product_name;
  orderParams.body.subtotal = req.body.subtotal;

  var token = req.body.stripeToken;
  var user = dbManager.getUserByEmail(req.body.email);
  var order = null;
  if (user === undefined ) {
    user = dbManager.createUser(userParams);
  } else {
    dbManager.updateUser(userParams, user.id)
  }

  // create stripe character
  stripe.customers.create({
    source: token,
    email: req.body.email,
    description: 'waiting for approvel for product '
  }).then(function(customer) {
    console.log(customer);
    // create order in db
    order = dbManager.createOrder(orderParams, user.id, customer.id, token);
    
    // charge amount
    stripe.charges.create({ 
      amount: order.subtotal,
      currency: 'cad',
      customer: customer.id,
      description: "Charges for " + order.product_name
    }, function(err, charge) {
      if (err) {
        console.log(err);
      } else {
        console.log("payment charged");
      }
    });

    req.app.mailer.send('trip_email', {
      to: 'stevey@bigtalkconsulting.com', 
      subject: 'New sale Consultation', 
      body: req.body,
      id: order.id,
      pname: order.product_name
    }, function (err) {
      if (err) {
        // handle error
        console.log(err);
        return;
      }
    });

    res.redirect('/cc/thank-you/' + req.body.dt );
  });
 
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Designed for Result',  path: req.path, isMobile: is_mobile(req) });
});

/* GET Landing page. */
router.get('/guide', function(req, res, next) {
  res.render('tripwire', { title: 'Step Guide | Designed For Result',  path: req.path, isMobile: is_mobile(req) });
});

router.get('/lp/guide', function(req, res, next) {
  res.render('landing/landing-part1', { title: 'Free Guide | Designed For Result',  path: req.path, isMobile: is_mobile(req)});
});

router.get('/wireframe-discount', function(req, res) {
  res.render('sales/sales1', { title: 'WireFrames | Designed For Result',  path: req.path, isMobile: is_mobile(req)});
});

router.get('/wireframe/thank-you/:id', function(req, res) {
  var order_id = req.params.id
  if (order_id) {
    res.render('sales/thankyou', { title: 'Thank You | Designed for Result', id: order_id,  path: req.path, isMobile: is_mobile(req)});
  } else {
    console.log('error')
    res.render('sales/error', { title: 'No Order | Designed for Result',  path: req.path, isMobile: is_mobile(req)});
  }
});

router.get('/cc/thank-you/:dt', function(req, res) {
  var s = req.params.dt.split(" ");
  var date = s[0];
  var time = s[1];
  res.render('tripthankyou', { title: 'Thank You | Designed for Result', 
    date: date, 
    time: time,  
    path: req.path, 
    isMobile: is_mobile(req)
  });
});

router.post('/wireframe/thank-you/done/:id', function(req, res) {
  var id = req.params.id;
  var order = dbManager.createOrderDetail(req, id);
  res.setHeader('Content-Type', 'application/json');
  if (order) {
    req.app.mailer.send('sale_email', {
      to: 'stevey@bigtalkconsulting.com', // REQUIRED. This can be a comma delimited string just like a normal email to field. 
      subject: 'New sale Wireframe', // REQUIRED.
      otherProperty: id // All additional properties are also passed to the template as local variables.
    }, function (err) {
      if (err) {
        // handle error
        console.log(err);
        return;
      }
      res.send(JSON.stringify({ 'success': 1 }));
    });
      
  } else {
    res.send(JSON.stringify({ 'success': 0 }));
  }
});

router.get('/getanswers', function (req, res, next) {
  res.render('contact', { title: 'Get Answers | Designed For Result',  path: req.path, isMobile: is_mobile(req)});
});

router.get('/test', function (req, res, next) {
  res.render('test', { title: 'Test Page | Designed For Result',  path: req.path, isMobile: is_mobile(req)});
});


/* Subscribe Mailchimp */
router.post('/subscribe', function (req, res, next) {
  console.log(req.body)
  var email = req.body.email;
  var mcReq = {
    id: MCID,
    email: { email: email },
    merge_vars: {
      EMAIL: req.body.email,
      FNAME: req.body.name,
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
      res.redirect('/checklist');
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
          path: req.path,
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
  req.app.mailer.send('email', {
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
Disallow: /cc/thank-you\n\
Disallow: /wireframe/thank-you\n\
Disallow: /wireframe-discount");
});


/* Legal Pages */

router.get('/terms', function(req, res) {
  res.render('terms', { title: 'Terms & Conditions | Designed For Result',  path: req.path, isMobile: is_mobile(req)});
});

router.get('/privacy', function(req, res) {
  res.render('privacy', { title: 'Privacy Policy | Designed For Result',  path: req.path, isMobile: is_mobile(req)});
});
module.exports = router;
