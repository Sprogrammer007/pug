var express = require('express')
  , passport = require('passport')
  , flash = require('connect-flash')
  , auth = require('./modules/auth')
  , session = require('express-session')
  , path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , mailer = require('express-mailer')
  , mcapi = require('./node_modules/mailchimp-api/mailchimp')
  , routes = require('./routes/route')
  , users = require('./routes/users')
  , blog = require('./routes/blog')
  , app = express()
  , fs = require('fs')
  , dbManager = require('./modules/database-manager')
  , MCKEY = process.env.MC_KEY;

// Setup Databaes
dbManager.init();


mc = new mcapi.Mailchimp(MCKEY);
// setup mailer
mailer.extend(app, {
  from: 'no-reply@gmail.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'steve00006@gmail.com',
    pass: 'process.env.GM_PASS'
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 6000000000 }}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);
app.use('/', blog);

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