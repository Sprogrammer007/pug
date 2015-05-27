var express = require('express');
var router = express.Router();
var testkey = "sk_test_0H0Rdb9qLzLzHEdMdjPMGtoh"
var stripe = require("stripe")(process.env.STRIPE_KEY);
var MCID = process.env.MC_ID || '9f81cf88cc';
var config = {};
var https = require('https');


var Client = require('pg-native');
var conString = process.env.DATABASE_URL || 'postgres://steve007:@localhost/dev_clash';
var client = new Client();
client.connectSync(conString);

// Insight API
var Insight_API_KEY = 'AIzaSyBnI_N9K8Rhdn9ostrrh18aJXuDHM2SUbI';

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

function getUserByEmail(req) {
  var query = 'SELECT * FROM users WHERE email=$1 LIMIT 1';
  var user = client.querySync(query, [req.body.email])
  return user[0];
}

function getOrderByToken(token) {
  var query = 'SELECT * FROM orders WHERE token=$1 LIMIT 1';
  var order = client.querySync(query, [token])
  return order[0];
}

function getDetailsByOrderID(order_id) {
  var query = 'SELECT * FROM order_details WHERE order_id=$1 LIMIT 1';
  var details = client.querySync(query, [order_id])
  return details[0];
}

function createUser(req) { 
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var params = req.body;
  var email = params.email;
  var name = params.name;
  var postal = params.postal;
  var phone = params.phone;
  var address = params.address;
  var city = params.city;
  var query = 'INSERT INTO users (name, email, phone, ip, address, postal, city) VALUES ($1, $2, $3, $4, $5, $6, $7)';
  client.querySync(query, [name, email, phone, ip, address, postal, city]);
  var user = getUserByEmail(req)
  return user;
}

function dollarToCent(dollar) {
  return (dollar * 100)
}

function createOrder(req, user_id, customer_id, token) {
  var params = req.body;
  var prodname = params.product_name
  var mail = params.shipping
  var subtotal = dollarToCent(params.sub_total);
  var status = "Pending"

  var query = 'INSERT INTO orders (user_id, stripe_cid, token, product_name, \
    mail, subtotal, status) VALUES ($1, $2, $3, $4, $5, $6, $7)';
  client.querySync(query, [user_id, customer_id, token, prodname, mail, subtotal, status]);
  var order = getOrderByToken(token)
  return order;
}

function createOrderDetail(req, id) {
  var params = req.body;
  var company = params.company_name;
  var position = params.position;
  var industry = params.industry;
  var years = params.year_business;
  var website = params.website;
  var important = params.website_importance;
  var purpose = params.website_for;
  var customer = params.customer;

  var query = 'INSERT INTO order_details (order_id, company_name, position, industry, \
    years, website, important, purpose, customer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
  client.querySync(query, [id, company, position, industry, years, website, important, purpose, customer]);
  var detail = getDetailsByOrderID(id)
  return detail;

}
//Routes

router.post('/checkout', function (req, res, next) {
  console.log(req.body)
  var token = req.body.stripeToken;
  // var user = getUserByEmail(req);
  var order = null;
  if (user === undefined ) {
    user = createUser(req);
  }


  stripe.customers.create({
    source: token,
    email: req.body.email,
    description: 'waiting for approvel for product '
  }).then(function(customer) {
    console.log(customer);
    order = createOrder(req, user.id, customer.id, token)
  });

  res.redirect('/wireframe/thank-you/' + order.id );
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Designed for Result',  path: req.path, isMobile: is_mobile(req) });
});

/* GET Landing page. */
router.get('/free-checklist', function(req, res, next) {
  res.render('landing/landing-part2', { title: 'Checklist | Designed For Result',  path: req.path, isMobile: is_mobile(req) });
});

router.get('/free-tips', function(req, res, next) {
  res.render('landing/landing-part1', { title: 'Free Tips | Designed For Result',  path: req.path, isMobile: is_mobile(req)});
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

router.post('/wireframe/thank-you/:id/done', function(req, res) {
  var id = req.params.id;
  var order = createOrderDetail(req, id);
  res.setHeader('Content-Type', 'application/json');
  if (order) {
    res.send(JSON.stringify({ 'success': 1 }));
  } else {
    res.send(JSON.stringify({ 'success': 0 }));
  }
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
      createUser(req);
      res.redirect('/free-checklist');
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
  var url = req.body.url;
  var report = '';
  https.get({
    host: 'www.googleapis.com', 
    path: '/pagespeedonline/v2/runPagespeed?url=' + encodeURIComponent(url) + 
          '&key='+Insight_API_KEY+'&strategy=desktop'
    }, function(r) {
      console.log("statusCode: ", res.statusCode);
      r.on('data', function(chunk) {
         report += chunk;
      });
      r.on('end', function(){
        report = JSON.parse(report);
        res.render('report', { title: 'Designed for Result || Speedtest Report',  path: req.path, report: report, isMobile: is_mobile(req) });
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
    res.setHeader('Content-Type', 'application/json');
    if (order) {
      res.send(JSON.stringify({ 'success': 1 }));
    } else {
      res.send(JSON.stringify({ 'success': 0 }));
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

module.exports = router;
