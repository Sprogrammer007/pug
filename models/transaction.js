var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Crypto = require('crypto')
  , Serializer = require('node-serialize')
  , Stripe = require("stripe")('sk_test_0H0Rdb9qLzLzHEdMdjPMGtoh')
  , _ = require('underscore');

var table = 'transactions';


function Transaction () {

}

Transaction.inherits(Base);

Transaction.findBy = function(k, v, done) {
  db.findBy(table, k, v, function(err, transactions) {
    if (err) { return done(err) };
    return done(false, _.first(transactions))
  });
};


Transaction.createCustomer = function(email, token, done) {
  Stripe.customers.create({source: token, email: email}, function(err, customer) {
    if (err) {
      console.log("Stripe err" + err);
      return done(false)      
    }
    return done(customer)
  });  
};

Transaction.create = function(user, customer, pkg, done) {
  Stripe.charges.create({ 
    amount: dollarToCent(pkg.price),
    currency: 'usd',
    customer: customer,
    description: "Purchased " + pkg.name
  }, function(err, charge) {
    db.create(table, prepareNewTransaction(user, charge, pkg), null, function(err, transaction){
      if (err) { return done(err) };
      return done(false, Base.convertObject(new Transaction(), transaction));
    });  
  });
};

// Private functions
function dollarToCent(dollar) {
  return (dollar * 100)
};

function prepareNewTransaction(user, charge, pkg) {
  return {
    user_id: user.id,
    customer_id: charge.customer,
    card_id: charge.source.id,
    charge_id: charge.id,
    invoice_id: charge.invoice,
    payment_type: charge.source.funding,
    product_name: pkg.name,
    status: charge.status,
    amount: charge.amount,
    refunded: charge.refunded,
    amount_ref: charge.amount_refunded,
    error_code: charge.failure_code,
    error_msg: charge.failure_message
  }
}
module.exports = Transaction;