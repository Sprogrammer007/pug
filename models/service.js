var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , bcrypt = require('bcrypt-nodejs')
  , _ = require('underscore');

var table = 'services'

function Service () {};

Service.findAllBy = function(k, v, done) {
  db.findBy(table, '*', k, v, function(err, services) {
    if (err || _.isEmpty(services)) { return done(err ? err : true) };
    return done(err, _.indexBy(services, 'type'));
  });
};

Service.findByCode = function(code, service, done) {
  var where = "refer_code=$1 AND user_id=$2 AND type=$3";
  var v = [code, code.substring(8), service];

  db.where(table, 'id, type, refer_code, options', where, v, 'id', 'ASC', function(err, service) {
    if (err || _.isEmpty(service)) { return done(err ? err : true) };
    return done(err, _.first(service));
  });
};

Service.create = function(p, done) {
  db.create(table, p, null, function(err, service){
    return done(err, service);
  });  
};

Service.update = function(p, id, done) {
  db.update(table, p, id, function(err, service) {
    if (err || _.isEmpty(service)) { return done(err ? err : true) };
    return done(false, _.first(service));
    return _.first(service);
  }); 
};

Service.createSurvey = function(user_id, done) {
  var options = {
    available_responses: 300,
    lifetime_reponses: 300,
    accepted_invites: 0,
    total_spending: 0,
    free_responses: 0,
    payment_method: 'Pay As You Go'
  }

  var token = Base.generateToken(4).concat(user_id).toUpperCase();
  Service.create({user_id: user_id, type:'Survey', options: options, refer_code: token}, function(err, service) {
    done(err, service);
  });
};


Service.incrementResponse = function(service, amount, cost, invite, done) {
  var options = service.options
  options.available_responses += amount;
  options.lifetime_reponses += amount;
  if (cost > 0) {
    options.total_spending += parseFloat(cost);
  } else { 
    if (invite) {
      options.accepted_invites += 1;
    }
    options.free_responses += amount;
  };
  Service.update({options: options}, service.id, function(err, service) {
    return done(err, service);
  });
};

Service.decrementResponse = function(id, options, amount, done) {
  options.available_responses -= amount;
  options.total_spending += amount;
  Service.update({options: options}, id, function(err, service) {
    return err ? false : true;
  });
}

Service.verifyCoupon = function(service, code, done) {
  var error = false;

  if (service.used_invite) {
    error = 'Another Invite Code has already been used.';
  };

  if (service.refer_code === code ) {
    error = 'You cannot use your own code.';
  };

  return done(error);
}



module.exports = Service;