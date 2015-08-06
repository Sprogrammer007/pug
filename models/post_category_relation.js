var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Serializer = require('node-serialize')
  , bcrypt = require('bcrypt-nodejs')
  , _ = require('underscore');

var table = 'post_category_relationships';

function PostCategoryRelation () {

};


PostCategoryRelation.updateAll = function(id, categories) {
  db.destroy(table, 'post_id', id, function(success){
    PostCategoryRelation.createAll(categories, id);
    return success;
  });
};

PostCategoryRelation.createAll = function(categories, id, callback) {
  db.manyToMany(table, ['post_id', 'category_id'], categories, id, function(success) {
    if (callback) {
      return callback(success);
    } else {
      return success;
    }
  });
};

module.exports = PostCategoryRelation;