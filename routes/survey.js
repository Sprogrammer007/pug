var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , passport = require('passport')
  , Survey = require('../models/survey')
  , SurveyPage = require('../models/survey_page')
  , SurveyQuestion = require('../models/survey_question');

router.post('/create', function (req, res, next) {
  var survey = Survey.create(req.body.survey);
  res.redirect('/s/' + survey.id + '/build');
});

// Question

router.get('/s/:id/b', function (req, res, next) {
  return res.render('admin/survey/builder', {
    title: h.titleHelper("Survey Builder"),
    path: req.originalUrl,
    isMobile: h.is_mobile(req),
    survey: req.params.id
  });
});

// Question

router.get('/s/:id', function (req, res, next) {
  Survey.findBy('id', req.params.id, function(survey) {
    return res.json(survey.toJson());
  });
});

//Create Question
router.post('/s/:id/q', function (req, res, next) {
  SurveyQuestion.create(req.body, req.params.id, function(question) {
    return res.json(question);
  });
});

//Create Question
router.post('/s/:id/p', function (req, res, next) {
  SurveyPage.create(req.body, req.params.id, function(page) {
    return res.json(page);
  });
});

// Single Survey

router.get('/:url', function (req, res, next) {

});


module.exports = router;
