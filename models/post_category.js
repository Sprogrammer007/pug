var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , bcrypt = require('bcrypt-nodejs')
  , _ = require('underscore');

var table = 'post_categories';

function PostCategory () {
  this.update = function(params) {
    db.update(table, params, this.id, function(pc) {
      return Base.convertObject(this, pc);
    }); 
  }
};

PostCategory.create = function(p, callback) {
  db.create(table, p, null, function(pc) {
    return callback(Base.convertObject(new PostCategory(), pc));
  });
};

PostCategory.all = function(callback) {

  db.all(table, 'category', 'DESC', function(pcs) {
    var a = [];
    _.map(pcs, function(p) {
      a.push(Base.convertObject(new PostCategory(), p));
    });
    return callback(a);
  });
};

module.exports = PostCategory;