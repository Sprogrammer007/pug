
var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , stripe = require("stripe")(process.env.STRIPE_KEY)
  , MCID = '9f81cf88cc'
  , MCID_Planner = '08f00544da'
  , https = require('https')
  , dbManager = require('../modules/database-manager');

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

router.get('/planner', function(req, res, next) {
  res.render('landing', { title: h.titleHelper('Website Planner'),  path: req.originalUrl, isMobile: is_mobile(req)});
});


/* GET tripwire page. */
router.get('/tp/v1', function(req, res, next) {
  - console.log(req)
  res.render('tripwire', { title: h.titleHelper('Step Guide'), 
     path: req.originalUrl, 
     isMobile: is_mobile(req),
     type: req.query.type
   });
});


router.post('/checkout', function (req, res, next) {
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

    req.app.mailer.send('/emails/trip_email', {
      to: 'stevey@bigtalkconsulting.com', 
      subject: 'New Order', 
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

    res.redirect('/lp/thank-you' );
  });
});



router.get('/thank-you', function(req, res) {
  res.render('tripthankyou', { 
    title: h.titleHelper('Thank You'), 
    path: req.originalUrl, 
    isMobile: is_mobile(req)
  });
});

module.exports = router;