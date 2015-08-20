var dbManager = require('../modules/database-manager')
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , _ = require('underscore');


// Private functions
function dollarToCent(dollar) {
  return (dollar * 100)
}


function Order () {
  this.update = function() {
    return
  }
}


Order.findBy = function(k, v) {
  var order;
  dbManager.findBy('orders', k, v, function(error, result) {
    order = result[0];
  });
  order = Base.convertObject(new Order(), order);
  return order;
}


Order.create = function(params, user_id, customer_id, receipt) {
  params['user_id'] = user_id;
  params['stripe_cid'] = customer_id;
  params['receipt'] = receipt;
  params['total'] = dollarToCent(parseInt(params.total));
  params['status'] = 'Payed';
   
  var Order = Base.convertObject(new Order(), dbManager.create('Orders', params, null));
  return Order;
}

module.exports = Order;