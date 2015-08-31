var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , bcrypt = require('bcrypt-nodejs')
  , _ = require('underscore');

var table = 'users';

function User () {
  this.update = function(params, callback) {
    db.update(table, params, this.id, function(user) {
      return Base.convertObject(this, user);
    }); 
  }
};

User.inherits(Base);
User.findBy = function(k, v, callback) {
  db.findBy(table, null, k, v, function(user) {
    if (user[0]) {

      return callback(Base.convertObject(new User(), user[0]));
    } else {
      return callback(false);
    }
  });
};

User.create = function(p, type, callback) {
  p['role'] = type || 'User';
  p['password'] = bcrypt.hashSync(p['password']);
  db.create(table, p, null, function(user) {
    return callback(Base.convertObject(new User(), user));
  });
};

module.exports = User;