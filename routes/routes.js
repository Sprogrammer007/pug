var express = require('express')
  , baseRoutes = require('./base')
  , users = require('./users')
  , blog = require('./blog')
  , survey = require('./survey')
  , order = require('./order')
  , landing = require('./landing')
  , admin = require('./admin/admin')
  , adminPost = require('./admin/post')
  , adminPost = require('./admin/post')
  , adminComment = require('./admin/comments')
  , adminPostCat = require('./admin/post_category')
  , app = express();


app.use('/', baseRoutes);
app.use('/', users);
app.use('/digest', survey);
app.use('/order', order);
app.use('/blog', blog);
app.use('/lp', landing);
app.use('/admin', admin);
app.use('/admin', adminPost);
app.use('/admin', adminPostCat);
app.use('/admin', adminComment);



module.exports = app;