var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , moment = require('moment')
  , Serializer = require('node-serialize')
  , bcrypt = require('bcrypt-nodejs')
  , Service = require('./service')
  , Transaction = require('./transaction')
  , Billing = require('./billing')
  , _ = require('underscore');

var table = 'users';

function User () {
  var hasChanged = false;
  this.update = function(params, done) {
    var that = this;
    db.update(table, params, that.id, function(err, user) {
      if (err) { return done(err) };
      that.touch();
      return done(err, _.extend(that, _.first(user)));
    }); 
  };

  this.touch = function() {
    hasChanged = true;
  }  

  this.untouch = function() {
    hasChanged = false;
  }

  this.touched = function() {
    return hasChanged;
  }

  this.updateActive = function() {
    this.update({last_active: moment().format()}, function(err, user) {
      return err ? false : true;
    });
  };

  this.updateService = function(params, id, done) {
    var that = this;
    Service.update(params, id, function(err, service) {
      if (err) { return done ? done(err) : err };
      that.touch();
      return done ? done(err, service) : service;
    }); 
  }

  this.confirmEmail = function(key, done) {
    if (this.status === "Confirmed") { return done({message: "Your account is already confirmed."}) };
    if (this.activation_key === key) {
      this.update({status: "Confirmed"}, function(err, user) {
        if (err) {return done({message: "Something went wrong, try reloading this page."})};
        return done(false);
      });
    } else {
      return done({message: 'We could not confirm your email.'})
    }
  }
  this.resendConfirm = function(done) {
    this.update({activation_key: Base.generateToken(8)}, function(err, user) {
      if (err) { return done(err, false) };
      return done(false, user);
    });
  };

  this.resetPassword = function(token, password, done) {
    var inValid = validatePassword(password, this.password, this.username);
    if (inValid) {
      return done({message: inValid})
    };
    password = bcrypt.hashSync(password);
    if (validToken(token, this)) {
      this.update({password: password, temp_pass_token: null}, function(err, user) {
        if (err) { return done({message: 'Something went wrong.'}) };
        return done(false);
      });
    } else {
      return done({message: 'The token is expired.'})
    }

  };

  this.resetDate = function() {
    if (this.reset_date) {
      return moment(this.reset_date).format("ddd, MMMM Do YYYY, h:mm:ss a");
    }
  };

  this.purchase = function(service, stripe, pkg, done) {
    var that = this;
    var token = stripe.token;
    var zip = stripe.zip;
    if (that.billings) {
      Transaction.create(that, that.billing.customer_id, pkg, donePayment);
    } else {
      Transaction.createCustomer(that.email, token, function(err, customer) {
        Billing.create(that, customer, zip, function(errB, billing) {
          tat.billing = billing;
          Transaction.create(that, customer.id, pkg, donePayment);
        });
      });
    };

    function donePayment(err, Transaction) {
      if (err) { return done(err) };
      if (that.billing) {
        that.billing.addSpending(pkg.price);
      }
      Service.incrementResponse(that.services[service], pkg.responses, pkg,price, false, function(service) {
        that.touch();
        that.services[service] = service;
        return done(false, that);
      });
    }
  };

  this.generateResetToken = function(done) {
    var token = Base.generateToken(8);
    this.update({temp_pass_token: token, reset_date: moment().format()}, function(err, user) {
      return done(user);
    });
  }

  this.isAdmin = function() {
    return this.role === 'Admin';
  };
  
  this.services = {};

  function validToken(user) {
    // 3 hour expire time
    return moment().isBefore(moment(user.reset_date).add(3, 'h'), 'hour')
  };
};

User.inherits(Base);

User.findBy = function(k, v, done) {
  db.findBy(table, null, k, v, function(err, users) {
    if (err || _.isEmpty(users)) { return done(err, false) };
    var user = Base.convertObject(new User(), _.first(users));
    Service.findAllBy('user_id', user.id, function (es, services) {
      user.services = services;
      Billing.findBy('user_id', user.id, function(eb, billing) {
        user.billing = billing;
        return done(false, user);
      });
    });

  });
};

User.create = function(p, role, service, done) {
  var inValid = validateUser(p);
  if (inValid) {
    return done({constraint: inValid}, null);
  };

  inValid = validatePassword(p.password);
  if (!p.account_type && inValid) {
     return done({constraint: inValid}, null);
  };
  p.role = role || 'User';
  p.password = (p.password) ? bcrypt.hashSync(p.password) : undefined;
  p.activation_key = Base.generateToken(8);
  p.status =  p.status || 'Active';

  db.create(table, p, null, function(err, user) {
    if (err) { return done(err) };
    user = Base.convertObject(new User(), _.first(user));
    Service['create' + service](user.id, function(err, service) {
      user.services[service] = service;
      return done(err, user);
    });
  });
};

User.createFacebook = function(fb, done) {
  var newUser = {
    facebook_id: fb.id,
    email: fb.email,
    username: fb.name.trim(),
    account_type: 'Facebook',
    status: 'Confirmed',
    profile: {avatar: fb.picture.data.url }
  }

  User.create(newUser, null, 'Survey', function(err, user) {
    return done(err, user)
  });
};

User.createGoogle = function(g, done) {
  var newUser = {
    google_id: g.id,
    email: g.emails[0].value,
    username: g.displayName.trim(),
    account_type: 'Google',
    status: 'Confirmed',
    profile: {avatar: g.image.url, plus_url: g.url }
  }

  User.create(newUser, null, 'Survey', function(err, user) {
    return done(err, user)
  });
}

function validateUser(p) {
  var errs = [];
  if (_.isEmpty(p.username)) {
    errs.push('Username is required');
  }  

  if (_.isEmpty(p.email)) {
    errs.push('Email is required');
  }

  if (_.isEmpty(p.password) && !p.account_type) {
    errs.push('Password is required');
  }
  if (_.isEmpty(errs)) { return false };
  return errs.join('/');
};

function validatePassword(password, oldpassword, username) {
  var errs = [];
  if (oldpassword) {
    if (bcrypt.compareSync(password, oldpassword)) {
      errs.push('Password is too similar to a recent password.');
    }    

    if (password === username) {
      errs.push('Password cannot be the same as your username.');
    }
  };

  if (!/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[A-Z]/.test(password) 
    || !/^.{6,}/.test(password)) {
    errs.push('Password is not strong enough.');
  } 
  return errs.join('/');
};

module.exports = User;