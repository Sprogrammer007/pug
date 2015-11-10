var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , Service = require('../../models/service')
  , Survey = require('../../models/survey')
  , SurveyResponse = require('../../models/survey_response');

// Builder

router.get('/surveys', function (req, res, next) {
  var service = req.user.services['Survey'];
  var template = (req.query.act || 'list');

  if (service.first_time) {
    if (req.query.act === 'edit') {
      Service.update({first_time: false}, service.id);
    } else {
      template = 'new';
    } 
  }

  return res.render('app/survey/' +  template, {
    title: h.titleHelper("Campaign Manager"),
    code: req.query.code
  });
});


router.get('/surveys/publishmodal', function(req, res, next) {
  return res.render('app/survey/_publish_modal')
});

router.get('/surveys/editbox', function(req, res, next) {
  return res.render('app/survey/_edit_box')
});


module.exports = router;
