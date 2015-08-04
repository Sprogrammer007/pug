var dbManager = require('../modules/database-manager')
    , Comment = require('./comment')
    , PostCategory = require('./post_category')
    , moment = require('moment')
    , Serializer = require('node-serialize')
    , _ = require('underscore');

//private helpers
function dbToObject(o, db) {
  for (var key in db) {  
    if (db.hasOwnProperty(key)) {
      o[key] = db[key];
    }
  }

  return o;
}

// post object

function Post() {

  this.update = function(params) {
    options = params.option;
    delete params.option;
    categories = params.categories;
    delete params.categories;
    params['posted_date'] = moment(params['posted_date']).format('YYYY-MM-DD') + " 12:00:00";
    dbManager.update('posts', params, this.id)
    PostCategory.update(this.id, categories);
    updatePostOptions(options, this.id);
  };

  this.options = {};

  this.getComments = function() {

    if (!this.id) { return }

    var comments = Comment.render('post_id', this.id)
    return comments
  };

  this.postDate = function(f) {
    if (this.posted_date) {
      return moment(this.posted_date).format(f);
    }
  };

  this.addComment = function(ip, params, user_id) {
    var comment = Comment.create(ip, params, user_id);
    return comment;
  };

  this.updateCommentCount = function() {
    var count = dbManager.count('comments', 'approved', {'post_id' : this.id, 'approved' : 'Approved'});
    dbManager.update('posts', {"comment_count" : count}, this.id);
    this.comment_count = count;
    return this;
  };

  this.createOptions = function(options) {
    var fields = ['post_id', 'option_key', 'option_value'];
    dbManager.createMultiple('post_options', fields , options, this.id);
  };

  // Private post method
  function updatePostOptions(v, id) {     

    var values = [];
    for (var h in v) { 
      if (v.hasOwnProperty(h)) {
        if (v[h].constructor == Object){
          v[h] = Serializer.serialize(v[h]);
        }
        values.push('(' + id + ", '" +  h + "', '" + v[h] + "')");
      }
    }
    var query = "UPDATE post_options AS t SET" +
    " option_value = c.value FROM" +
    " (VALUES " + values.join(", ") + " )" +
    " AS c(id, key, value)" + 
    " WHERE c.id=t.post_id AND c.key=t.option_key;"
    dbManager.rawQuery(query);
  };

}

// Class methods

Post.create = function(params, categories, user) {
  params['url'] = params.title.trim().replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-').toLowerCase();
  params['post_type'] = 'Post';
  params['Author'] = user.username;
  params['user_id'] = user.id;

  var post = dbToObject(new Post(), dbManager.create('posts', params, null));

  if (categories && !_.isEmpty(categories)) {
    dbManager.createRelation('post_category_relationships', ['post_id', 'category_id'], categories, post.id);
  }
  return post;
}

Post.destroy = function(id) {
  dbManager.destroy('posts', 'id', id);
  dbManager.destroy('post_options', 'post_id', id);
  dbManager.destroy('post_categories', 'post_id', id);
}

Post.all = function() {
  posts = [];
  _.map(Post.queries("All"), function(p){
    p = dbToObject(new Post(), p);
    posts.push(p);
  });
  return posts;
} 

Post.findBy = function(k, v) {
  result = Post.queries(k, v)[0];
  post = dbToObject(new Post(), result);

  dbManager.findAllBy('post_options', 'option_key, option_value', 'post_id', post.id).forEach(function(e, i ,a) {
    post.options[e['option_key']] = Serializer.unserialize(e['option_value']);
  });

  return post;
}

Post.queries = function(k, v) {
  var query = "SELECT a.*," +
    " array_agg(c.category) AS categories" +
    " FROM posts a" +
    " LEFT OUTER JOIN post_category_relationships b ON a.id=b.post_id" +
    " LEFT OUTER JOIN post_categories c ON c.id IN (b.category_id)" +
    " WHERE a.post_type='Post'" + 
    ((k === 'All') ? " " : (" AND a." + k + "='" + v + "'" )) + 
    " GROUP BY a.id" +
    " ORDER BY posted_date DESC;"
  return dbManager.rawQuery(query);  
}

Post.incrementCommentCount = function(id) {
  var query = "UPDATE posts SET comment_count = comment_count + 1 WHERE id=" + id + ";";
  dbManager.rawQuery(query);
};

module.exports = Post;