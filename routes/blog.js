  var express = require('express')
  , moment = require('moment')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , dbManager = require('../modules/database-manager')
  , passport = require('passport');


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




function formatDate(string) {
  return moment(string).format('YYYY-MM-DD');
}

// Blog

router.get('/', function (req, res, next) {
  var posts = dbManager.getAllLivePosts();
  posts.forEach(function(e, i, a) {
    e.create_date = moment(e.create_date).format('MMMM Do, YYYY');
  });
  return res.render('blog/list', { title: h.titleHelper('Blog'),  path: req.originalUrl, isMobile: is_mobile(req), posts: posts});
});

// Single Post

router.get('/:url', function (req, res, next) {
  var post = dbManager.getPostByURL(req.params.url);
  if (post) {
    post.create_date = moment(post.create_date).format('MMMM Do, YYYY');
    return res.render('blog/single', { title: h.titleHelper(post.title),  path: req.originalUrl, isMobile: is_mobile(req), post: post});
  } else {
    res.redirect('/404');
  }

});



module.exports = router;
