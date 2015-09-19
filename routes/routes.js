var express = require('express')
  , baseRoutes = require('./base')
  , users = require('./users')
  , blog = require('./blog')
  , order = require('./order')
  , landing = require('./landing')
  , survey = require('./be/survey')
  , campaign = require('./be/campaign')
  , post = require('./be/post')
  , comment = require('./be/comments')
  , postcat = require('./be/post_category')
  , app = express();


app.use('/', baseRoutes);
app.use('/', users);

app.use('/order', order);
app.use('/blog', blog);
app.use('/lp', landing);

app.use('/campaign', survey);
app.use('/campaign', campaign);
app.use('/campaign', post);
app.use('/campaign', postcat);
app.use('/campaign', comment);

module.exports = app;