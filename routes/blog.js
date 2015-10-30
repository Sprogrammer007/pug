  var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , passport = require('passport')
  , Post = require('../models/post');

// Blog

router.get('/', function (req, res, next) {
  Post.all('All', null, function(posts) {
    return res.render('blog/list', { 
      title: h.titleHelper('Blog'),
      posts: posts
    });
  });
});

// Single Post

router.get('/:url', function (req, res, next) {
  Post.findBy('url', req.params.url, function(post){
    if (post) {
      return res.render('blog/single', { 
        title: h.titleHelper(post.title),
        post: post,
        options: post.options
      });
    } else {
      res.redirect('/404');
    }
  });
});

// Comment Submit

router.post('/comment', function (req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  Post.findBy('url', req.params.url, function(post){
  });
});


module.exports = router;
