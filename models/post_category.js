var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , bcrypt = require('bcrypt-nodejs')
  , _ = require('underscore');

var table = 'post_categories';

function PostCategory () {
};

PostCategory.create = function(p, done) {
  db.create(table, p, null, function(err, category) {
    if (err) { return done(err) };
    return done(_.first(category));
  });
};

PostCategory.all = function(done) {
  db.all(table, 'category', 'DESC', function(err, categories) {
    if (err) { return done(err) };
    return done(false, categories);
  });
};

module.exports = PostCategory;