var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , Post = require('../../models/post')


// All Surveys
router.get('/p', function(req, res, next) {
  Post.all('user_id', req.user.id, function(err, posts) {
    if (err) { return res.json(h.errorMSG())}
    return res.json(posts);
  });
});

// Single Survey
router.get('/p/:id', function (req, res, next) {
  Post.findBy('id', req.params.id, function(err, post) {
    if (err) { return res.json(h.errorMSG())}
    return res.json(post);
  }, true);
});


module.exports = router;