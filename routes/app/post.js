var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , Post = require('../../models/post')
  , PostCategory = require('../../models/post_category');

// Index Posts
router.get('/posts', function (req, res, next) {
  if (req.user && req.user.role === "Admin") {
    delete req.user['password']
    var template = (req.query.act || 'list');
    return res.render('app/posts/' +template, { 
      title: h.titleHelper('Posts')
    });
  } else {
    req.flash('error', "please login!");
    return res.redirect('/login');  
  }
});

//Post Api

router.get('/p', function(req, res, next) {
  if (req.user) {
    Post.all('user_id', req.user.id, function(posts) {
      posts.map(function(post) {
        post.toJson();
      });
      return res.json(posts);
    });
  } else {  
    return res.status(401).send('Not Logged In'); 
  }
});


// // New Post
// router.get('/post/new', function (req, res, next) {
//   if (req.user && req.user.role === "Admin") {
//     PostCategory.all(function(categories) {
//       return res.render('app/posts/new', { 
//         title: h.titleHelper('New Post'),
//         path: req.path, 
//         user: req.user
//       });
//     });
//   } else {
//     req.flash('error', "please login!")
//     return res.redirect('/login'); 
//   }
// });

// // Create Post

// router.post('/post/create', function (req, res, next) {
//   if (req.user && req.user.role === "Admin") {
//     options = req.body.post.option;
//     delete req.body.post.option;

//     Post.create(req.body.post, req.body.categories, req.user, function(post) {
//       post.createOptions(options);
//       return res.redirect('/campaign/posts');
//     });
//   } else {
//     req.flash('error', "please login!")
//     return res.redirect('/login');  
//   }
// });

// // Edit Post

// router.get('/post/edit/:id', function (req, res, next) {
//   if (req.user && req.user.role === "Admin") {
//     Post.findBy('id', req.params.id, function(post) {
//       PostCategory.all(function(categories) {
//         return res.render('campaign/posts/edit', { 
//           title: h.titleHelper('Edit Post'), 
//           categories: categories,
//           post: post
//         });
//       });
//     }); 
//   } else {
//     req.flash('error', "please login!")
//     return res.redirect('/login');  
//   }
// });

// // Update Post

// router.post('/post/update/:id', function (req, res, next) {
//   if (req.user && req.user.role === "Admin") {
//     Post.findBy('id', req.params.id, function(post) {
//       post.update(req.body.post);
//       return res.redirect('/campaign/posts');
//     });
//   } else {
//     req.flash('error', "please login!")
//     return res.redirect('/login');  
//   }
// });

// // Delete Post
// router.get('/post/delete/:id', function (req, res, next) {
//   if (req.user && req.user.role === "Admin") {
//     Post.findBy('id', req.params.id, function(post) {
//       post.destroy();
//       return res.redirect('/campaign/posts');
//     });
//   } else {
//     req.flash('error', "please login!")
//     return res.redirect('/login');  
//   }
// });


module.exports = router;