var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , Service = require('../../models/service')
  , List = require('../../modules/list')
  , User = require('../../models/user');

// All Surveys
router.get('/user/services', function(req, res, next) {
  var user = req.user;
   Service.findAllBy('user_id', user.id, function (err, services) {
    if (err) { return res.json(h.errorMSG()) }
    user.services = services;
    return res.json(services); 
  });
});

// Make Payment

router.post('/user/payment', function(req, res, next) {
  req.user.purchase(req.body.service, req.body.stripe, req.body.pkg, function(err, user) {
    if (err) { return res.json(h.errorMSG('Transaction did not go through.'))}
    return res.json(user.services[req.body.service]); 
  });
});

// Use Coupon

router.post('/user/coupon', function(req, res, next) {
  var user = req.user;
  var type = req.body.service;
  // Check if code is valid.
  Service.verifyCoupon(req.user.services[type], req.body.coupon, function(error) {
    if (error) {return  res.json(h.errorMSG(error)) };
  });
  Service.findByCode(req.body.coupon, type, function(err, service){
    if (err) { return res.json(h.errorMSG('Invalid Code')) }; 

    Service.incrementResponse(user.services[type], 250, 0, false, function(err, s) {
      if (err) { return res.json(h.errorMSG('Unable to apply coupon please try again.')) }; 
      Service.incrementResponse(service, 50, 0, true);
      return res.json({success: true, service: s});
    });
  });
});

router.post('/user/update/service/:id', function(req, res, next) {
  req.user.updateService(req.body, req.params.id);
  return res.json({success: true});
});

router.get('/user/confirm/resend', function(req, res, next) {
  req.user.resendConfirm(function(err, user) {
    if (err) { return res.json(h.errorMSG()) }; 
    res.mailer.send('emails/confirm_email', {
      to: user.email,
      subject: "Confirm Your Email",
      otherProperty: {user: user}
    }, function(err) {
      if (err) { return console.log (err) };
    }); 
    return res.json({success: true});
  });
});

module.exports = router;