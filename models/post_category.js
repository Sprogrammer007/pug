var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Serializer = require('node-serialize')
  , bcrypt = require('bcrypt-nodejs')
  , _ = require('underscore');

var table = 'post_categories';

function dbToObject(o, db) {
  for (var key in db) {  
    if (db.hasOwnProperty(key)) {
      o[key] = db[key];
    }
  }
  return o;
}

function PostCategory () {
  this.update = function(params) {
    db.update(table, params, this.id, function(pc) {
      return dbToObject(this, pc);
    }); 
  }
};

PostCategory.create = function(p, callback) {
  db.create(table, p, null, function(pc) {
    return callback(dbToObject(new PostCategory(), pc));
  });
};

PostCategory.all = function(callback) {

  db.all(table, 'category', 'DESC', function(pcs) {
    var a = [];
    _.map(pcs, function(p) {
      a.push(dbToObject(new PostCategory(), p));
    });
    return callback(a);
  });
};

module.exports = PostCategory;