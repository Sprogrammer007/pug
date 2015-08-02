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

function PostCategory () {
  this.update = function(params) {
    return dbToObject(this, dbManager.update('post_categories', params, this.id));
  }
}

PostCategory.create = function(p) {
  return dbToObject(new PostCategory(), dbManager.create('post_categories', p, null));
};

PostCategory.all = function() {
  var pcs = [];
  _.map(dbManager.getAll('post_categories', null, 'category', 'DESC'), function(p){
    pc = dbToObject(new PostCategory(), p);
    pcs.push(pc);
  });
  return pcs;
};

PostCategory.update = function(id, categories) {
  dbManager.destroy('post_category_relationships', 'post_id', id);
  dbManager.createRelation('post_category_relationships', ['post_id', 'category_id'], categories, id);
}

module.exports = PostCategory;