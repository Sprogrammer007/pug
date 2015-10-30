var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , Survey = require('../../models/survey')
  , SurveyPage = require('../../models/survey_page')
  , SurveyQuestion = require('../../models/survey_question')
  , SurveyResponse = require('../../models/survey_response');

// All Surveys
router.get('/s', function(req, res, next) {
  Survey.all(req.user.id, function(err, surveys) {
    if (err) { return res.json(h.errorMSG())}
    return res.json(surveys);
  });
});

// Single Survey
router.get('/s/:id', function (req, res, next) {
  Survey.findBy('id', req.params.id, function(err, survey) {
    if (err) { return res.json(h.errorMSG())}
    if (parseInt(survey.user_id) === parseInt(req.user.id)) {
      return res.json(survey);
    }
    return res.json(h.errorMSG('Not Your Survey')); 
  }, false, false);
});

// Create Survey
router.post('/s', function(req, res, next) {
  Survey.create(req.body, req.user.id, function(err, s) {
    if (err) { return res.json(h.errorMSG()) };
    return res.json(s); 
  });
});

// Update Survey
router.put('/s/:id', function (req, res, next) {
  Survey.update(req.body, req.params.id, function(err, survey) {
    if (err) { return res.json(h.errorMSG('Failed to update'))}
    return res.json({success: true}); 
  });
});

// Survey status
router.put('/s/:id/status', function (req, res, next) {
  if (req.body.new_status === 'Published' && req.user.status === 'Active') {
    return res.json({success: false, message: ['Please confirm email.']});
  };
     
  if (req.user.services['Survey'].options.available_responses === 0) {
    return res.json({success: false, message: ['You have 0 responses available, please purchase some.']});
  }
    
  Survey.toggleStatus(req.params.id, req.body, function(err, r) {
    if (err) { return res.json(err) };
    res.json({success: true, survey: r});
  });
});

//Create Question
router.post('/s/:id/q', function (req, res, next) {
  SurveyQuestion.create(req.body, req.params.id, function(err, question) {
    if (err) { return res.json(h.errorMSG()) };
    Survey.increment(req.params.id, 'question_count', 1);
    return res.json(question); 
  });
});

//Update Question

router.put('/s/q/:id', function (req, res, next) {
  SurveyQuestion.update(req.body, req.params.id, function(err, q) {
    if (err) { return res.json(h.errorMSG('Failed to update'))}
    return res.json({success: true}); 
  });
});

//Update Question Position

router.post('/s/qo', function (req, res, next) {
  SurveyQuestion.updatePositions(req.body, function(err, r) {
    if (err) { return res.json(h.errorMSG())}
    return res.json({success: true}); 
  });
});

//Delete Question

router.delete('/s/:sid/q/:id', function(req, res, next) {
  SurveyQuestion.destroy('id', req.params.id, function(err, r) {
    if (err) { return res.json(h.errorMSG('Failed to update'))}
    Survey.decrement(req.params.sid, 'question_count', 1);
    return res.json({success: true}); 
  });
});

//Create Page
router.post('/s/:id/p', function (req, res, next) {
  SurveyPage.create(req.body, req.params.id, function(err, page) {
    if (err) { return res.json(h.errorMSG()) }
    Survey.increment(req.params.id, 'page_count', 1);
    return res.json(page);
  });
});

//Delete Page
router.delete('/s/:sid/p/:id', function(req, res, next) {
  var query = req.query;
  SurveyPage.destroy('id', req.params.id, query, function(err, r) {
    if (err) { return res.json(h.errorMSG()) };
    Survey.decrement(req.params.sid, 'page_count', 1);
    if (!query.newPage && query.count > 0) {
      Survey.decrement(req.params.sid, 'question_count', query.count);
    }
    return res.json({success: true});
  });
});

//Get Response

router.get('/r/:id/all', function(req, res, next) {
  SurveyQuestion.getAllResponse(req.params.id, function(err, r) {
    if (err) { return res.json(h.errorMSG()) };
    return res.json(r);
  }) 
});

//Get All Response for User Count

router.get('/r/:id/counts', function(req, res, next) { 
  SurveyResponse.allCounts(req.params.id, req.query, function(err, r) {
    if (err) { return res.json(h.errorMSG()) };
    return res.json(r);
  }); 
});

module.exports = router;