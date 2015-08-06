var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , Post = require('../../models/post')
  , PostCategory = require('../../models/post_category');

// Index Posts
router.get('/posts', function (req, res, next) {
  if (req.user && req.user.role === "Admin") {

    Post.all(function(posts) {
      return res.render('admin/posts/index', { 
        title: h.titleHelper('Posts'),  
        path: req.path, 
        isMobile: h.is_mobile(req), 
        posts: posts
      });
    });
  } else {
    req.flash('error', "please login!");
    return res.redirect('/admin/login');  
  }
});

// New Post
router.get('/post/new', function (req, res, next) {
  if (req.user && req.user.role === "Admin") {
    PostCategory.all(function(categories) {
      return res.render('admin/posts/new', { 
        title: h.titleHelper('New Post'),
        path: req.path, 
        isMobile: h.is_mobile(req), 
        categories: categories,
        user: req.user
      });
    });
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login'); 
  }
});

// Create Post

router.post('/post/create', function (req, res, next) {
  if (req.user && req.user.role === "Admin") {
    options = req.body.post.option;
    delete req.body.post.option;

    Post.create(req.body.post, req.body.categories, req.user, function(post) {
      post.createOptions(options);
      return res.redirect('/admin/posts');
    });
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});

// Edit Post

router.get('/post/edit/:id', function (req, res, next) {
  if (req.user && req.user.role === "Admin") {
    Post.findBy('id', req.params.id, function(post) {
      PostCategory.all(function(categories) {
        return res.render('admin/posts/edit', { 
          title: h.titleHelper('Edit Post'), 
          path: req.path, 
          isMobile: h.is_mobile(req), 
          categories: categories,
          post: post
        });
      });
    }); 
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});

// Update Post

router.post('/post/update/:id', function (req, res, next) {
  if (req.user && req.user.role === "Admin") {
    Post.findBy('id', req.params.id, function(post) {
      post.update(req.body.post);
      return res.redirect('/admin/posts');
    });
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});

// Delete Post
router.get('/post/delete/:id', function (req, res, next) {
  if (req.user && req.user.role === "Admin") {
    Post.findBy('id', req.params.id, function(post) {
      post.destroy();
      return res.redirect('/admin/posts');
    });
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});


module.exports = router;