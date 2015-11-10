var express = require('express')
  , h = require('../modules/application_helpers')
  , baseRoutes = require('./base')
  , user = require('./user')
  , blog = require('./blog')
  , survey = require('./survey')
  , landing = require('./landing')
  , surveyApp = require('./app/survey')
  , campaign = require('./app/campaign')
  , post = require('./app/post')
  , postcat = require('./app/post_category')
  , surveyAPI = require('./api/survey')
  , userAPI = require('./api/user')
  , postAPI = require('./api/post')
  , app = express();

var ApiToken = require('../modules/ApiToken');


// Preset for all Response
app.use('/', function(req, res, next) {
  res.locals.isMobile =  h.isMobile(req);
  res.locals.path = req.path;
  app.locals.user = req.user;
  next()
});

app.use('/', baseRoutes);
app.use('/account', user);

app.use('/blog', blog);
app.use('/s', survey);
app.use('/l', landing);

// Account Logged In Varify
app.use('/campaign', ensureAuthenticated);

app.use('/campaign', surveyApp);
app.use('/campaign', campaign);
app.use('/campaign', post);
app.use('/campaign', postcat);


// API Token Varify
app.use('/api', function(req, res, next) {
  var token = req.body.session_token || req.query.session_token || req.headers['session-token'];
 
  if (ApiToken.verify(token))  {
    if (req.isAuthenticated()) { return next() } 
    return res.status(403).send({message: "Not Logged In."});
  } else {
    return res.status(403).send({ 
      success: false, 
      message: 'Failed to authenticate token.' 
    });
  }
});
app.use('/api', surveyAPI);
app.use('/api', userAPI);
app.use('/api', postAPI);


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    app.locals.token = ApiToken.generate();
    return next(); 
  }
  req.flash('error', "Please login!");
  res.redirect('/account/login')
}


module.exports = app;