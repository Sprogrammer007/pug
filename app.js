var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mailer = require('express-mailer');
var mcapi = require('./node_modules/mailchimp-api/mailchimp');
var routes = require('./routes/route');
var users = require('./routes/users');

var app = express();
var fs = require('fs');
var MCKEY = process.env.MC_KEY || '8b8bff773968e11ac3881a74bb8bef66-us10'
// try {
//   var configJSON = fs.readFileSync(__dirname + "/config.json");
//   var config = JSON.parse(configJSON.toString());
// } catch (e) {
//   console.error("File config.json not found or is invalid: " + e.message);
//   process.exit(1);
// }


mc = new mcapi.Mailchimp(MCKEY);
// setup mailer
mailer.extend(app, {
  from: 'no-reply@gmail.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'steve00008@gmail.com',
    pass: 'nningbb007'
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    var status = err.status || 500
    res.status(status);
    res.render(status.toString(), {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  var status = err.status || 500
  res.status(status);
  res.render(status.toString(), {
    message: err.message,
    error: {}
  });
});


module.exports = app;