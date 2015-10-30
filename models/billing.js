var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , _ = require('underscore');

var table = 'billings';

function Billing () {
  this.update = function(p, done) {
    db.update(table, p, this.id, function(err, r) {
      if (err) { return done(err) };
      return done ? done(false, r) : r;
    }); 
  };

  this.addSpending = function(amount) {
    amount = parseFloat(this.total_spending) + parseFloat(amount);
    this.update({total_spending: amount});
  }
}

Billing.inherits(Base);

Billing.create = function(user, customer, zip, done) {
  var billing = {
    user_id: user.id,
    customer_id: customer.id,
    primary_card_id: customer.default_source,
    card_zip: zip
  }
  db.create(table, billing, null, function(err, b){
    if (err) { return done(err) };
    return done(false, Base.convertObject(new Billing(), b));
  });  
};


Billing.findBy = function(k, v, done) {
  db.findBy(table, null, k, v, function(err, billings) {
    if (err || _.isEmpty(billings)) { return done(err ? err : true) };
    return done(Base.convertObject(false, new Billing(), _.first(billings)));

  });
};


module.exports = Billing;