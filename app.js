var express = require('express')
  , inheritance = require('./modules/inheritance')
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

  //route files
  , routes = require('./routes/routes')
  , app = express()
  , fs = require('fs')
  , db = require('./modules/db');
// setup mailer
mailer.extend(app, {
  from: 'no-reply@gmail.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'steve00006@gmail.com',
    pass: 'guybrush'
  }
});


app.use(function(req, res, next){
  res.locals.isActive = function(a, b) {
    var queryIndex = a.indexOf('?')
    var path = (queryIndex > -1)? a.substring(0, queryIndex) : a;
    return (path === b) ? 'active' : ''
  };
  next();
})

app.locals.default_description = "We design tools to make your marketing fun.";
app.locals.deafult_og_image = "https://s3.amazonaws.com/designforresult/og_images/default_og.png";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Favicon
app.use(favicon(__dirname + '/public/favicon.ico'));

//Cookie Params Parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//Statics
app.use(express.static(path.join(__dirname, 'public')));
//Loggin
app.use(logger('dev'));

//Sessions
app.use(session({ secret: toString(Math.random()), 
  cookie: { maxAge: 60*24*60*60*1000 },
  resave: true,
  saveUninitialized: false
}));

//Auth
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

app.use(function(err, req, res, next) {
  var status = err.status || 500
  res.status(status);
  err = (app.get('env') === 'production') ? err : err;
  res.render(status.toString(), {
    message: err.message,
    error: err
  });
});




module.exports = app;