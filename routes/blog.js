  var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , passport = require('passport')
  , Post = require('../models/post');


// Blog

router.get('/', function (req, res, next) {
  var p = Post.all();
  return res.render('blog/list', { 
    title: h.titleHelper('Blog'), 
    path: req.originalUrl, 
    isMobile: h.is_mobile(req),
    posts: p
  });
});

// Single Post

router.get('/:url', function (req, res, next) {
  var post = Post.findBy('url', req.params.url);
  post.updateCommentCount();

  var comments = post.getComments();
   
  if (post) {

    return res.render('blog/single', { 
      title: h.titleHelper(post.title), 
      path: req.originalUrl, 
      isMobile: h.is_mobile(req), 
      post: post,
      options: post.options,
      comments: comments
    });
  } else {
    res.redirect('/404');
  }

});

// Comment Submit

router.post('/comment', function (req, res, next) {

  var post = Post.findBy('id', req.body.comments.post_id)
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  var comment = post.addComment(ip, req.body.comments, ((req.user) ? req.user.id : null));
  
  if (comment) {
    return res.json({'success': "1"});
  } else {
    return res.json({'failure': "1"});
  }
});




module.exports = router;
