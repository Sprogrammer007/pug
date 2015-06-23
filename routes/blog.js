  var express = require('express')
  , moment = require('moment')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , querystring = require('querystring')
  , https = require('https')
  , dbManager = require('../modules/database-manager')
  , passport = require('passport');


var Insight_API_KEY = process.env.INSIGHT_KEY || 'AIzaSyBMMa9dBTGZ70abFZ-MkQ1C1U_-7zeJpjg';

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

function getGPlusCount(url) {
  var data = JSON.stringify({
    "method":"pos.plusones.get",
    "id": 'p',
    "params":{
        "nolog":true,
        "id": url,
        "source":"widget",
        "userId":"@viewer",
        "groupId":"@self"
    },
    "jsonrpc":"2.0",
    "key":"p",
    "apiVersion":"v1"
  });

  var post_options = {
    host: 'clients6.google.com',
    port: '443',
    path: '/rpc?key=' + Insight_API_KEY,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
  };
  
  // Set up the request
  var post_req = https.request(post_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
     console.log('Response: ' + chunk);
    });
  });


  post_req.write(data);
  post_req.end();

} 

function formatDate(string) {
  return moment(string).format('YYYY-MM-DD');
}

// Blog

router.get('/blog', function (req, res, next) {
  var posts = dbManager.getAllLivePosts();
  posts.forEach(function(e, i, a) {
    e.create_date = moment(e.create_date).format('MMMM Do, YYYY');
  });
  return res.render('blog/list', { title: h.titleHelper('Blog'),  path: req.path, isMobile: is_mobile(req), posts: posts});
});

// Single Post

router.get('/blog/:url', function (req, res, next) {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  var post = dbManager.getPostByURL(req.params.url);
  console.log(fullUrl)
  getGPlusCount(fullUrl);
  if (post) {
    post.create_date = moment(post.create_date).format('MMMM Do, YYYY');
    return res.render('blog/single', { title: h.titleHelper(post.title),  path: req.path, isMobile: is_mobile(req), post: post});
  } else {
    res.redirect('/404');
  }

});



// Posts

router.get('/admin', function (req, res, next) {
  if (req.user) {
    return res.redirect('/admin/posts');  
  } else {
    req.flash('error', "please login!");
    return res.redirect('/admin/login');  
  }
});
router.get('/admin/posts', function (req, res, next) {
  if (req.user) {
    var posts = dbManager.getAllPosts();    
    posts.forEach(function(e, i, a) {
      e.create_date = formatDate(e.create_date);
    });
    return res.render('blog/posts', { title: h.titleHelper('Post List'),  path: req.path, isMobile: is_mobile(req), posts: posts});
  } else {
    req.flash('error', "please login!");
    return res.redirect('/admin/login');  
  }
});

// New Post
router.get('/admin/post/new', function (req, res, next) {
  if (req.user) {
    return res.render('blog/new', { title: h.titleHelper('New Post'),  path: req.path, isMobile: is_mobile(req), user: req.user});
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login'); 
  }
});

// Create Post

router.post('/admin/post/create', function (req, res, next) {
  if (req.user) {
    dbManager.createPost(req);
    return res.redirect('/admin/posts');
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});

// Edit Post

router.get('/admin/post/edit/:id', function (req, res, next) {
  if (req.user) {
    var post = dbManager.findPostByID(req.params.id);
    post.create_date = formatDate(post.create_date);
    return res.render('blog/edit', { title: h.titleHelper('Edit Post'),  path: req.path, isMobile: is_mobile(req), post: post});
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});

// Update Post

router.post('/admin/post/update/:id', function (req, res, next) {

  if (req.user) {
    dbManager.updatePost(req);
    return res.redirect('/admin/posts');
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});

// Delete Post


router.get('/admin/post/delete/:id', function (req, res, next) {

  if (req.user) {
    var post = dbManager.deletePost(req.params.id);
    return res.redirect('/admin/posts');
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});


// Login page
router.get('/admin/login', function (req, res, next) {
  var message = req.flash('error');
  res.render('blog/login', { title: h.titleHelper('Login'),  path: req.path, isMobile: is_mobile(req), message: message});
});

router.post('/admin/login', function (req, res, next) {
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

router.get('/admin/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
module.exports = router;
