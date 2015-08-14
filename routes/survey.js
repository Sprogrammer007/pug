var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , passport = require('passport')
  , Survey = require('../models/survey')
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

router.get('/s/:id/g', function (req, res, next) {
  Survey.findBy('id', req.params.id, function(survey) {
    return res.json(survey);
  });
});

router.post('/s/:id/question/create', function (req, res, next) {
  console.log(req.body.question)
  SurveyQuestion.create(req.body.question, req.params.id, function(question) {
    return res.json({'success': "1", 'question': JSON.stringify(question)});
  });

});

// Single Survey

router.get('/:url', function (req, res, next) {

});




module.exports = router;
