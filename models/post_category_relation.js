var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , bcrypt = require('bcrypt-nodejs')
  , _ = require('underscore');

var table = 'post_category_relationships';

function PostCategoryRelation () {

};


PostCategoryRelation.updateAll = function(id, categories) {
  db.destroy(table, 'post_id', id, function(result){
    PostCategoryRelation.createAll(categories, id);
    return result;
  });
};

PostCategoryRelation.createAll = function(categories, id, done) {
  db.createMulti(table, ['post_id', 'category_id'], categories, id, function(result) {
    return _.isFunction(done) ? done(result) : result
  });
};

module.exports = PostCategoryRelation;