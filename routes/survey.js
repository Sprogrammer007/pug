  var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , passport = require('passport')
  , Post = require('../models/post');

var q1 = ['How to create a business website (Step by Step)', 
                'How to get more leads with your website', 
                'How to make money or generate passive income with your website.', 
                'How to increase conversion for your website.', 
                'How to build an ecommerce website.', 
                'How to increase brand awareness though smart Design,',
                'How Best to structure your content on your website.',
                'How to build a mobile friendly website.',
                'How to increase engagement on your website.',
                'How to build your website fully optimized for search engines (SEO).',
                ]
// Blog

router.get('/', function (req, res, next) {

  return res.render('survey/survey', { 
    title: h.titleHelper('Digest'), 
    path: req.originalUrl, 
    isMobile: h.is_mobile(req),
    q1: q1
  });
});

// Single Post

router.get('/:url', function (req, res, next) {

});




module.exports = router;
