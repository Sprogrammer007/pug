var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , Post = require('../../models/post')
  , PostCategory = require('../../models/post_category');

// Index Posts
router.get('/posts', function (req, res, next) {
  var template = (req.query.act || 'list');

  return res.render('app/posts/' +  template, {
    title: h.titleHelper("Campaign Manager")
  });
});





module.exports = router;