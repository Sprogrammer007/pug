
var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , stripe = require("stripe")(process.env.STRIPE_KEY)
  , MCID = process.env.MC_ID
  , https = require('https')
  , AWS = require('aws-sdk')
  , s3 = new AWS.S3()
  , User = require('../models/user');


router.get('/planner', function(req, res, next) {
  res.render('funnel/landing', { 
    title: h.titleHelper('Website Planner'),  
    path: req.originalUrl, 
    isMobile: h.is_mobile(req)
  });
});


/* Subscribe Mailchimp */
router.post('/subscribe', function (req, res, next) {

  var email = req.body.email;
  var mcReq = {
    id: '08f00544da',
    email: { email: email },
    merge_vars: {
      EMAIL: email,
      FNAME: req.body.name,
      FTRIPV1: 'No'
    },
    email_type: 'html',
    double_optin: false,
    update_existing: true,
    replace_interests: true,
    send_welcome: true
  };

  

  mc.lists.subscribe(mcReq, function(data) {
    console.log('User subscribed successfully! Look for the confirmation email.');
    res.redirect('/lp/tp/v1');
  },
  function(error) {
    if (error.error) {
      console.log(error.code + ": " + error.error);
    } else {
      console.log('There was an error subscribing that user');
    }
    res.redirect(req.originalUrl);
  });
 
});


/* GET tripwire page. */
router.get('/tp/v1', function(req, res, next) {
  var price = (req.cookies.tpdiscount === 'seen') ? 40 : 20;
  res.render('funnel/tripwire', { 
    title: h.titleHelper('Planner Download'),
     navOff: true,
     price: price
   });
});



module.exports = router;