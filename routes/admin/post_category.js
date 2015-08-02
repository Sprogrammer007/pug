
var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , PostCategory = require('../../models/post_category');

// List Category
router.get('/categories', function (req, res, next) { 
  if (req.user && req.user.role === "Admin") {
    var categories = PostCategory.all();    

    return res.render('admin/categories/index', {
      title: h.titleHelper('Dashboard'),  
      path: req.path, 
      isMobile: h.is_mobile(req), 
      categories: categories });
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});

// New Category

router.get('/category/new', function (req, res, next) {
  if (req.user && req.user.role === "Admin") {
    return res.render('admin/categories/new', { 
      title: h.titleHelper('New Category'),
      path: req.path, 
      isMobile: h.is_mobile(req), 
      user: req.user
    });
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login'); 
  }
});

// Create Category

router.post('/category/create', function (req, res, next) {
  if (req.user && req.user.role === "Admin") {
    PostCategory.create(req.body);
    return res.redirect('/admin/categories');
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});


module.exports = router;
