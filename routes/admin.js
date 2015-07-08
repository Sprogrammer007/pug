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
};
// Posts

router.get('/', function (req, res, next) {
  if (req.user) {
    return res.redirect('/admin/posts');  
  } else {
    req.flash('error', "please login!");
    return res.redirect('/admin/login');  
  }
});
router.get('/posts', function (req, res, next) {
  if (req.user) {
    var posts = dbManager.getAllPosts();    
    posts.forEach(function(e, i, a) {
      e.create_date = formatDate(e.create_date);
    });
    return res.render('admin/posts', { title: h.titleHelper('Post List'),  path: req.path, isMobile: is_mobile(req), posts: posts});
  } else {
    req.flash('error', "please login!");
    return res.redirect('/admin/login');  
  }
});

// New Post
router.get('/post/new', function (req, res, next) {
  if (req.user) {
    return res.render('admin/new', { title: h.titleHelper('New Post'),  path: req.path, isMobile: is_mobile(req), user: req.user});
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login'); 
  }
});

// Create Post

router.post('/post/create', function (req, res, next) {
  if (req.user) {
    dbManager.createPost(req);
    return res.redirect('/admin/posts');
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});

// Edit Post

router.get('/post/edit/:id', function (req, res, next) {
  if (req.user) {
    var post = dbManager.findPostByID(req.params.id);
    post.create_date = formatDate(post.create_date);
    return res.render('admin/edit', { title: h.titleHelper('Edit Post'),  path: req.path, isMobile: is_mobile(req), post: post});
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});

// Update Post

router.post('/post/update/:id', function (req, res, next) {

  if (req.user) {
    dbManager.updatePost(req);
    return res.redirect('/admin/posts');
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});

// Delete Post


router.get('/post/delete/:id', function (req, res, next) {

  if (req.user) {
    var post = dbManager.deletePost(req.params.id);
    return res.redirect('/admin/posts');
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});


// Login page
router.get('/login', function (req, res, next) {
  var message = req.flash('error');
  res.render('admin/login', { title: h.titleHelper('Login'),  path: req.path, isMobile: is_mobile(req), message: message});
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/admin/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/admin/posts');
    });
  })(req, res, next);
});

// Logout

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


module.exports = router;
