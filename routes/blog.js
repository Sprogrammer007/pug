  var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , passport = require('passport')
  , Post = require('../models/post');

// Blog

router.get('/', function (req, res, next) {
  Post.all('All', null, function(err, posts) {
    return res.render('blog/list', { 
      title: h.titleHelper('Blog'),
      posts: posts
    });
  });
});

// Single Post

router.get('/:url', function (req, res, next) {
  Post.findBy('url', req.params.url, function(err, post){
    if (err) { return  res.redirect('/404'); }
    return res.render('blog/single', { 
      title: h.titleHelper(post.title),
      post: post
    });
  
  }, true);
});


module.exports = router;
