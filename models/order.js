var dbManager = require('../modules/database-manager')
    , Serializer = require('node-serialize')
    , _ = require('underscore');


// Private functions
function dollarToCent(dollar) {
  return (dollar * 100)
}

function dbToObject(o, db) {
  for (var key in db) {  
    if (db.hasOwnProperty(key)) {
      o[key] = db[key];
    }
  }

  return o;
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
  order = dbToObject(new Order(), order);
  return order;
}


Order.create = function(params, user_id, customer_id, receipt) {
  params['user_id'] = user_id;
  params['stripe_cid'] = customer_id;
  params['receipt'] = receipt;
  params['total'] = dollarToCent(parseInt(params.total));
  params['status'] = 'Payed';
   
  var Order = dbToObject(new Order(), dbManager.create('Orders', params, null));
  return Order;
}

module.exports = Order;