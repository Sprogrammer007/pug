var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , PostCategoryRelation = require('./post_category_relation')
  , moment = require('moment')
  , Serializer = require('node-serialize')
  , _ = require('underscore');

var table = 'posts';

// post object

function Post() {
  this.options = {};
  this.update = function(params) {
    options = params.option;
    delete params.option;
    categories = params.categories;
    delete params.categories;
    params['posted_date'] = moment(params['posted_date']).format('YYYY-MM-DD') + " 12:00:00";
   
    db.update('posts', params, this.id, function(post) {
      if (post[0]) {
        PostCategoryRelation.updateAll(post[0].id, categories);
        updatePostOptions(options, post[0].id);
        return true;
      } else {
        return false;
      }
    });
  };

  this.postDate = function(f) {
    if (this.posted_date) {
      return moment(this.posted_date).format(f);
    }
  };

  this.destroy = function() {
    db.destroy(table, 'id', this.id, function(success) {
      if (success) {
        db.destroy('post_categories', 'post_id', this.id);
        return true
      } else {
        return false
      }
    });
  };
}

// Class methods

Post.create = function(p, categories, user, done) {
  delete p.categories;
  p['url'] = createPostUrl(p.title)
  p['post_type'] = 'Post';
  p['Author'] = user.username;
  p['user_id'] = user.id;
  db.create('posts', p, null, function(err, post) {

    if (err) { return done(err) };
    post = _.first(post);
    if (categories && !_.isEmpty(categories)) {
      PostCategoryRelation.createAll(categories, post.id);
    }
    return done(false, post);
  });
}

Post.all = function(k, v, done) {
  queries(k, v, function(err, posts){

    if (err) { return done(err) };
    posts.forEach( function(p){
      Base.convertObject(new Post(), p);
    });
    return done(false, posts);
  });
}; 

Post.findBy = function(k, v, done, convert) {
  queries(k, v, function(err, post) {
    if (err) { return done(err) };
    post = _.first(post);
    if (convert) {
      post = Base.convertObject(new Post(), post);
    } 
    return done(false, post);
  });
}

function createPostUrl(title) {
  return  title.trim().replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-').toLowerCase();
};

function queries (k, v, done) {

  var query = "SELECT a.*," +
    " array_agg(c.category) AS categories" +
    " FROM posts a" +
    " LEFT OUTER JOIN post_category_relationships b ON a.id=b.post_id" +
    " LEFT OUTER JOIN post_categories c ON c.id IN (b.category_id)" +
    " WHERE a.post_type='Post'" + 
    ((k === 'All') ? " " : (" AND a." + k + "='" + v + "'" )) + 
    " GROUP BY a.id" +
    " ORDER BY posted_date DESC;"
  return db.rawQuery(query, function(err, result) {
    return done(err, result);
  });  
}


module.exports = Post;