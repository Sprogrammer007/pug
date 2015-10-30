var express = require('express')
  , h = require('../modules/application_helpers') // Helpers
  , router = express.Router()
  , Survey = require('../models/survey')
  , Service = require('../models/service')
  , SurveyResponse = require('../models/survey_response');


router.get('/:id', function (req, res, next) {
  Survey.findBy('token', req.params.id, function(err, survey) {
    var error = undefined;
    if (err) { error = 'No Survey Found'; } 
    if (survey && !survey.isPublished()) { error = 'Survey is Unavailable.' };

    Service.findAllBy('user_id', survey.user_id, function(err, services) {
      if (services['Survey'].options.available_responses === 0) {
        error = 'Survey is Unavailable.'
      }
      return res.render('app/survey/show', {
        title: h.titleHelper(error ? error : "Survey " + survey.token),
        survey: survey,
        error: error
      });
    });
  }, true);
});



router.post('/response/:id', function (req, res, next) {
  Survey.findBy('token', req.params.id, function(err, survey) {
    Service.findAllBy('user_id', survey.user_id, function(err, services) {
      var service = services['Survey'];
      if (service.options.available_responses === 0) {
        return res.json(h.errorMSG());
      }
    
      if (survey && survey.isPublished()) {  
        SurveyResponse.create(survey, req.body, function(err, r) {
          if (err) { return res.json(h.errorMSG()) };
          Survey.increment(survey.id, 'response', 1);
          Service.decrementResponse(service.id, service.options, 1);
          res.json(r)
        });
      } else {
        return res.json(h.errorMSG())
      }
    });
  }, true, true);
});


module.exports = router;
