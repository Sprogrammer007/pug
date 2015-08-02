var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , Comments = require('../../models/comment');



// List Category
router.get('/comments', function (req, res, next) { 
  if (req.user && req.user.role === "Admin") {
    var comments = Comments.all();    

    return res.render('admin/comments/index', {
      title: h.titleHelper('Comments'),  
      path: req.path, 
      isMobile: h.is_mobile(req), 
      comments: comments });
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});


// Approve Comment
router.get('/comment/:id/approve', function (req, res, next) { 
  if (req.user && req.user.role === "Admin") {
    
    var comment = Comments.findBy('id', req.params.id);    
    comment.update({'approved' : 'Approved'});  
    comment.updatePostCommentCount();
    return res.redirect('/admin/comments');
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});

// Remove Comment
router.get('/comment/:id/destroy', function (req, res, next) { 
  if (req.user && req.user.role === "Admin") {
    var comment = Comments.findBy('id', req.params.id);    
    comment.destroy();
    return res.redirect('/admin/comments');
  } else {
    req.flash('error', "please login!")
    return res.redirect('/admin/login');  
  }
});


module.exports = router;