var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , Survey = require('../../models/survey')
  , SurveyResponse = require('../../models/survey_response');

// Builder

router.get('/surveys', function (req, res, next) {
  var service = req.user.services['Survey'];

  var template = (req.query.act || 'list');
  var invite = false;

  if (service.first_time && req.query.act !== 'edit') {
    template = 'new'
  } 

  if (service.first_time && req.query.act === 'edit') {
    invite = true;
  }
  var filter = (template === 'list') ? true : false
  return res.render('app/survey/' +  template, {
    title: h.titleHelper("Campaign Manager"),
    filter : filter,
    code: req.query.code,
    invite: invite
  });
});


router.get('/surveys/publishmodal', function(req, res, next) {
  return res.render('app/survey/_publish_modal')
});

router.get('/surveys/editbox', function(req, res, next) {
  return res.render('app/survey/_edit_box')
});


module.exports = router;
