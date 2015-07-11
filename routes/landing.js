
var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , stripe = require("stripe")(process.env.STRIPE_KEY)
  , MCID = process.env.MC_ID
  , https = require('https')
  , AWS = require('aws-sdk')
  , s3 = new AWS.S3()
  , dbManager = require('../modules/database-manager');
// var stripe = require("stripe")('sk_test_0H0Rdb9qLzLzHEdMdjPMGtoh');

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
  var price = (req.cookies.tpdiscount === 'seen') ? 40 : 20;
  res.render('tripwire', { title: h.titleHelper('Planner Download'), 
     path: req.originalUrl, 
     isMobile: is_mobile(req),
     navOff: true,
     price: price
   });
});


router.post('/checkout', function (req, res, next) {
  var price = (req.cookies.tpdiscount === 'seen') ? 40 : 20;
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
  orderParams.body.total = price;

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
    description: 'purchased 4 conversion layout'
  }).then(function(customer) {
  
    // create order in db
      
    // charge amount
    stripe.charges.create({ 
      amount: price*100,
      currency: 'cad',
      customer: customer.id,
      description: "4 Conversion Layout Plus Bonus"
    }, function(err, charge) {
      if (err) {
        console.log(err);
      } else {
        order = dbManager.createOrder(orderParams, user.id, customer.id, token, charge.receipt_number);
        console.log("payment charged");
      }
    });

    // Update mail chimp
    var mcReq = {
      id: MCID,
      email: { email: req.body.email },
      merge_vars: {
        FTRIPV1: 'Yes'
      },
      email_type: 'html',
      replace_interests: true
    };

    mc.lists.updateMember(mcReq, function(data) {
      console.log('User updated success');
    },
    function(error) {
      if (error.error) {
        console.log(error.code + ": " + error.error);
      } else {
        console.log('There was an error updating that user');
      }
    });

    res.redirect('/lp/thankyou/'+ order.receipt);
  });
});



router.get('/thankyou/:receipt', function(req, res) {
  var order = dbManager.getOrderByReceipt(req.params['receipt']);
  var params = {Bucket: 'designforresult', Key: 'ucl_v1.zip', Expires: 450};
  var url = s3.getSignedUrl('getObject', params);
  // if (!order) {
  //   return res.redirect('/');
  // } else {
    res.render('tripthankyou', { 
      title: h.titleHelper('Thank You'), 
      path: req.originalUrl, 
      isMobile: is_mobile(req),
      // oNum: order.receipt,
      url: url
    });
  // };
});

module.exports = router;