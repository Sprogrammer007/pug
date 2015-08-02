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
  //route files
  , routes = require('./routes/routes')
  , app = express()
  , fs = require('fs')
  , db = require('./modules/db')
  , dbManager = require('./modules/database-manager')
  , MCKEY = process.env.MC_KEY;

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
    pass: process.env.GM_PASS
  }
});

// if (process.env.RUN_DB === 'true') {
  db.init();
// }

app.locals.default_description = "We love beautiful designs too, but beauty alone doesn\'t always deliver result for your business. Designed for Result will help you get clear on the objecti";
app.locals.deafult_og_image = "https://s3.amazonaws.com/designforresult/og_images/default_og.png";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: toString(Math.random()), 
  cookie: { maxAge: 9000000000 },
  resave: true,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use(routes);

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
module.exports = app;