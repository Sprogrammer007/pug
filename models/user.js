var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Serializer = require('node-serialize')
  , bcrypt = require('bcrypt-nodejs')
  , _ = require('underscore');

var table = 'users';

function dbToObject(o, db) {
  for (var key in db) {  
    if (db.hasOwnProperty(key)) {
      o[key] = db[key];
    }
  }
  return o;
}

function User () {
  this.update = function(params, callback) {
    db.update(table, params, this.id, function(user) {
      return dbToObject(this, user);
    }); 
  }
};

User.findBy = function(k, v, callback) {
  db.findBy(table, null, k, v, function(user) {
    if (user[0]) {
      return callback(dbToObject(new User(), user[0]));
    } else {
      return callback(false);
    }
  });
};

User.create = function(p, type) {
  p['role'] = type || 'User';
  p['password'] = bcrypt.hashSync(p['password']);
  db.create(table, p, null, function(user) {
    return callback(dbToObject(new User(), user));
  });
};

module.exports = User;