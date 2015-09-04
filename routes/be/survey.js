var express = require('express')
  , h = require('../../modules/application_helpers') // Helpers
  , router = express.Router()
  , passport = require('passport')
  , Survey = require('../../models/survey')
  , SurveyPage = require('../../models/survey_page')
  , SurveyQuestion = require('../../models/survey_question');

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
      return res.json(survey.toJson());
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

router.patch('/s/q/:id', function (req, res, next) {
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

router.delete('/s/q/:id', function(req, res, next) {
  SurveyQuestion.destroy(req.params.id, function(r) {
    return res.json({'success': r});
  });
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

router.delete('/s/p/:id', function(req, res, next) {
  if (req.user) {
    SurveyPage.destroy(req.params.id, function(r) {
      Survey.decrement(req.params.id, 'page_count');
      return res.json({'success': r});
    });
  } else {  
    return res.status(401).send('Not Logged In'); 
  }
});



module.exports = router;
