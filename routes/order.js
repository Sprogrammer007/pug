
var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , stripe = require("stripe")(process.env.STRIPE_KEY)
  , MCID = process.env.MC_ID
  , https = require('https')
  , AWS = require('aws-sdk')
  , s3 = new AWS.S3()
  , User = require('../models/user')
  , Order = require('../models/order');
// var stripe = require("stripe")('sk_test_0H0Rdb9qLzLzHEdMdjPMGtoh');


router.post('/checkout', function (req, res, next) {
  var price, token, orderParams, user, order, ip;
  price = (req.cookies.tpdiscount === 'seen') ? 40 : 20;
  ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  token = req.body.token;

  orderParams = req.body.order;
  orderParams['total'] = price;

  user = User.create(req.body.user);

  // create stripe character
  stripe.customers.create({
    source: token,
    email: req.body.user.email,
    description: 'purchased 4 conversion layout'
  }).then(function(customer) {
    // Make the charge
    stripe.charges.create({ 
      amount: price*100,
      currency: 'cad',
      customer: customer.id,
      description: "4 Conversion Layout Plus Bonus"
    }, function(err, charge) {
      if (err) {
        console.log(err);
      } else {
        order = Order.create(orderParams, user.id, customer.id, charge.receipt_number);
        console.log("payment charged");
      }
    });

    // Update mail chimp
    var mcReq = {
      id: MCID,
      email: { email: req.body.user.email },
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
  var order = Order.findBy('receipt', req.params['receipt']);
  var s3P = {Bucket: 'designforresult', Key: 'ps/ucl_v1.zip', Expires: 450};
  var url = s3.getSignedUrl('getObject', s3P);
  if (!order) {
    return res.redirect('/');
  } else {
    res.render('funnel/tripthankyou', { 
      title: h.titleHelper('Thank You'), 
      path: req.originalUrl, 
      isMobile: h.is_mobile(req),
      oNum: order.receipt,
      url: url
    });
  };
});

module.exports = router;