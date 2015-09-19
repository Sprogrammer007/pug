var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , Survey = require('../../models/survey')
  , SurveyPage = require('../../models/survey_page')
  , SurveyQuestion = require('../../models/survey_question')
  , SurveyResponse = require('../../models/survey_response');

// Builder

router.get('/surveys', function (req, res, next) {
  if (req.user) {
    delete req.user['password']
    var template = (req.query.act || 'list');
    return res.render('be/survey/' +  template, {
      title: h.titleHelper("Campaign Manager"),
      path: req.originalUrl,
      isMobile: h.is_mobile(req),
      user: req.user
    });
  } else {
    req.flash('error', "please login!");
    return res.redirect('/login');  
  }
});

router.get('/survey/:id', function (req, res, next) {
  Survey.findBy('token', req.params.id, function(survey) {
     return res.render('be/survey/show', {
      title: h.titleHelper("Survey " + survey.token),
      path: req.originalUrl,
      isMobile: h.is_mobile(req),
      survey: survey
    });
  });
});

router.get('/surveys/publishmodal', function(req, res, next) {
  return res.render('be/survey/_publish_modal')
});

router.get('/surveys/editbox', function(req, res, next) {
  return res.render('be/survey/_edit_box')
});

//Survey Api

router.get('/s', function(req, res, next) {
  if (req.user) {
    Survey.all(req.user.id, function(surveys) {
      return res.json(surveys);
    });
  } else {  
    return res.status(401).send('Not Logged In'); 
  }
});

router.post('/s', function(req, res, next) {
  if (req.user) {
    Survey.create(req.body, req.user.id, function(s) {
      return res.json(s.toJson()); 
    });
  } else {  
     return res.status(401).send('Not Logged In'); 
  }
});

// Get Survey

router.get('/s/:id', function (req, res, next) {
  if (req.user) {
    Survey.findBy('id', req.params.id, function(survey) {
      if (parseInt(survey.user_id) === parseInt(req.user.id)) {
        return res.json(survey.toJson());
      } else {
        return res.status(401).send('Not Logged In'); 
      }
    });
  } else {  
    return res.status(401).send('Not Logged In'); 
  }
});

router.put('/s/:id', function (req, res, next) {
  if (req.user) {
    Survey.update(req.params.id, req.body, function(s) {
      res.json(s.toJson());
    });
  } else {  
    return res.status(401).send('Not Logged In'); 
  }
});

//Create Question
router.post('/s/:id/q', function (req, res, next) {
  if (req.user) {
    SurveyQuestion.create(req.body, req.params.id, function(question) {
      Survey.increment(req.params.id, 'question_count');
      return res.json(question); 
    });
  } else {  
     return res.status(401).send('Not Logged In'); 
  }
});

//Update Question

router.put('/s/q/:id', function (req, res, next) {
  SurveyQuestion.findBy('id', req.params.id, function(q) {
    q.update(req.body, function(r) {
      return res.json({'success': r});
    });
  });
});

//Update Question Position

router.post('/s/qo', function (req, res, next) {
  SurveyQuestion.updatePositions(req.body, function(r) {
    var success = r ? true : false
    return res.json({'success': success});
  });
});

//Delete Question

router.delete('/s/:sid/q/:id', function(req, res, next) {
  if (req.user) {
    SurveyQuestion.destroy(req.params.id, function(r) {
      Survey.decrement(req.params.sid, 'page_count', 1);
      return res.json({'success': r});
    });
  } else {  
    return res.status(401).send('Not Logged In'); 
  }
});

//Create Page
router.post('/s/:id/p', function (req, res, next) {
  if (req.user) {
    SurveyPage.create(req.body, req.params.id, function(page) {
      Survey.increment(req.params.id, 'page_count');
      return res.json(page);
    });
  } else {  
     return res.status(401).send('Not Logged In'); 
  }
});

//Delete Page

router.delete('/s/:sid/p/:id', function(req, res, next) {
  if (req.user) {
    SurveyPage.destroy(req.params.id, function(r) {
      Survey.decrement(req.params.sid, 'page_count', 1);
      return res.json({'success': r});
    });
  } else {  
    return res.status(401).send('Not Logged In'); 
  }
});

//Get Response

router.get('/r/:id/all', function(req, res, next) {
  if (req.user) {
    SurveyQuestion.getAllResponse(req.params.id, function(r) {
      return res.json(r);
    }) 
  } else {  
    return res.status(401).send('Not Logged In'); 
  }
});

//Get All Response for User Count

router.get('/r/:id/counts', function(req, res, next) {
  if (req.user) {
    SurveyResponse.allCounts(req.params.id, req.query, function(r) {
      return res.json(r);
    }); 
  } else {  
    return res.status(401).send('Not Logged In'); 
  }
});

module.exports = router;
