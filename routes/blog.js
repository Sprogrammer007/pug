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
      path: req.originalUrl, 
      isMobile: h.is_mobile(req),
      posts: posts
    });
  });
});

// Single Post

router.get('/:url', function (req, res, next) {
  Post.findBy('url', req.params.url, function(post){
    if (post) {
    
      post.updateCommentCount();
      post.getComments(function(comments) {
        return res.render('blog/single', { 
          title: h.titleHelper(post.title), 
          path: req.originalUrl, 
          isMobile: h.is_mobile(req), 
          post: post,
          options: post.options,
          comments: comments
        });
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
    if (post) {
      post.addComment(ip, req.body.comments, ((req.user) ? req.user.id : null), function(comment) {
        if (comment) {
          return res.json({'success': "1"});
        } else {
          return res.json({'failure': "1"});
        }
      });
    }
  });
});


module.exports = router;
