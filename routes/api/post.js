var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , Post = require('../../models/post')
  , PostCategory = require('../../models/post_category')


// All Posts
router.get('/p', function(req, res, next) {
  Post.all('user_id', req.user.id, function(err, posts) {
    if (err) { return res.json(h.errorMSG())}
    return res.json(posts);
  });
});

// Single Post
router.get('/p/:id', function (req, res, next) {
  Post.findBy('id', req.params.id, function(err, post) {
    if (err) { return res.json(h.errorMSG())}
    return res.json(post);
  }, true);
});

// Create Post
router.post('/p', function (req, res, next) {
  Post.create(req.body.post, req.body.categories, req.user, function(err, post) {
    if (err) { return res.json(h.errorMSG())}
    return res.json(post);
  })
});

router.get('/post/categories', function(req, res, next) {
  PostCategory.all(function(err, categories) {
    if (err) { return res.json(h.errorMSG())}
    return res.json(categories);
  });
});


module.exports = router;