var dbManager = require('../modules/database-manager')
  , Serializer = require('node-serialize')
  , bcrypt = require('bcrypt-nodejs')
  , _ = require('underscore');



function dbToObject(o, db) {
  for (var key in db) {  
    if (db.hasOwnProperty(key)) {
      o[key] = db[key];
    }
  }

  return o;
}

function User () {
  this.update = function(params) {
    return dbToObject(this, dbManager.update('users', params, this.id));
  }
}



User.findBy = function(k, v) {
  var user;
  dbManager.findBy('users', k, v, function(error, result) {
    user = result[0];
  });
  user = dbToObject(new User(), user);
  return user;
}

User.create = function(p, type) {
  p['role'] = type || 'User';
  p['password'] = bcrypt.hashSync(p['password']);
  var user = dbToObject(new User(), dbManager.create('users', p, null));
  return user;
}
module.exports = User;