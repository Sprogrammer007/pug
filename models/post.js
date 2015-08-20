var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Comment = require('./comment')
  , PostCategoryRelation = require('./post_category_relation')
  , moment = require('moment')
  , Serializer = require('node-serialize')
  , _ = require('underscore');

var table = 'posts';


// post object

function Post() {

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

  this.options = {};

  this.getComments = function(callback) {
    if (!this.id) { return callback(false); }
    Comment.render('post_id', this.id, function(comments) {
      return callback(comments);
    });
  };

  this.postDate = function(f) {
    if (this.posted_date) {
      return moment(this.posted_date).format(f);
    }
  };

  this.addComment = function(ip, params, user_id, callback) {
    Comment.create(ip, params, user_id, function(comment){
      return callback(comment);
    });
  };

  this.updateCommentCount = function() {
    var that = this;
    db.count('comments', 'approved', {'post_id' : that.id, 'approved' : 'Approved'}, function(count){
      db.update(table, {"comment_count" : count}, that.id);
      that.comment_count = count;
      return that;
    });

  };

  this.createOptions = function(options) {
    var fields = ['post_id', 'option_key', 'option_value'];
    db.createMulti('post_options', fields , options, this.id);
  };

  this.destroy = function() {
    db.destroy(table, 'id', this.id, function(success) {
      if (success) {
        db.destroy('post_options', 'post_id', this.id);
        db.destroy('post_categories', 'post_id', this.id);
        return true
      } else {
        return false
      }
    });
  };

  // Private post method
  function updatePostOptions(values, id) {     
    var values =  _.map(values, function(v, k) {
      if (values.hasOwnProperty(k) && values[k] != '') {
         v = (values[k].constructor == Object) ? Serializer.serialize(values[k]) : values[k];
         return ('(' + id + ", '" + k + "', '" + v + "')");
      }
    });

    var query = "UPDATE post_options AS t SET" +
    " option_value = c.value FROM" +
    " (VALUES " + values.join(", ") + " )" +
    " AS c(id, key, value)" + 
    " WHERE c.id=t.post_id AND c.key=t.option_key;"
    return db.rawQuery(query);  
  };
}

Post.inherits(Base);

// Class methods

Post.create = function(params, categories, user, callback) {
  params['url'] = params.title.trim().replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-').toLowerCase();
  params['post_type'] = 'Post';
  params['Author'] = user.username;
  params['user_id'] = user.id;
  db.create('posts', params, null, function(post) {
    var p = Base.convertObject(new Post(), post);

    if (categories && !_.isEmpty(categories)) {
      PostCategoryRelation.createAll(categories, p.id);
    }
    return callback(p);
  });
}

Post.all = function(callback) {
  Post.queries("All", null, function(posts){
    var ps = [];
    _.map(posts, function(p){
      ps.push(Base.convertObject(new Post(), p));
    });
    return callback(ps);
  });
} 

Post.findBy = function(k, v, callback) {
  Post.queries(k, v, function(result) {
    var post = Base.convertObject(new Post(), result[0]);
   
    db.findBy('post_options', 'option_key, option_value', 'post_id', post.id, function(options){
      if (options) {
        options.forEach(function(e, i ,a) {
          post.options[e['option_key']] = Serializer.unserialize(e['option_value']);
        });
      }
      return callback(post);
    });
  });
}

Post.queries = function(k, v, done) {

  var query = "SELECT a.*," +
    " array_agg(c.category) AS categories" +
    " FROM posts a" +
    " LEFT OUTER JOIN post_category_relationships b ON a.id=b.post_id" +
    " LEFT OUTER JOIN post_categories c ON c.id IN (b.category_id)" +
    " WHERE a.post_type='Post'" + 
    ((k === 'All') ? " " : (" AND a." + k + "='" + v + "'" )) + 
    " GROUP BY a.id" +
    " ORDER BY posted_date DESC;"
  return db.rawQuery(query, function(result) {
    return done(result);
  });  
}


module.exports = Post;