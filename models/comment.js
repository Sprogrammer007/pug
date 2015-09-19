var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , moment = require('moment')
  , _ = require('underscore');

var table = 'comments';


function formatDate(date) {
  var day = moment(date).format('YYYYMMDDHHmmss')
  return moment(day, "YYYYMMDDHHmmss").fromNow();
}

function Comment() {
  this.replies = function() {
    // TODO run query to get replies for comment
    return true;
  };

  this.destroy = function(callback) {
    db.destroy(table, 'id', this.id, function(success) {
      if (!callback) { return success }; 
      return callback(success)
    });
  };

  this.update = function(params, callback) {
    db.update(table, params, this.id, function(comment) {
      if (!callback) { return comment }; 
      return callback(comment)
    });
  };

  this.updatePostCommentCount = function() {
    var query = "UPDATE posts SET comment_count = comment_count + 1 WHERE id=" + this.post_id + ";";
    db.rawQuery(query, function(result) {
      return(result ? true : false);
    });
  };
};

Comment.findBy = function(k, v, callback) {
  db.findBy(table, null, k, v, function(comment) {
    if (comment[0]) {
      return callback(Base.convertObject(new Comment(), comment[0]));
    } else {
      return callback(false);
    }
  });
}

Comment.create = function(ip, params, user_id, callback) {
  if (params['content'] === '' ) {return false};
  params['approved'] = 'Pending';
  if (params['comment_parent']) {params['comment_parent'] = parseInt(params.comment_parent)};
  params['author_ip'] = ip;
  if (user_id) {
    params['user_id'] = user_id;
  }
  db.create('comments', params, null, function(comment){;
    if (comment) {
      return callback(Base.convertObject(new Comment(), comment));
    } else {
      return callback(false);
    }
  });
};

Comment.all = function(callback) {
  db.all(table, 'comment_date', 'DESC', function(cs) {
    var a = [];
    _.map(cs, function(c) {
      a.push(Base.convertObject(new Comment(), c));
    });
    return callback(a);
  });
};

// Comments template
function commentTemplate (comment) {
  var html = '<div id="comment-' + comment.id + '" class="comment-wrapper" >' +
    ((comment.comment_parent != null) ? "<span class='arrow-up'></span>" : "") +
    "<div class='row'>" +
      "<div class='comment-avatar'>" +
        "<img src='//s3.amazonaws.com/designforresult/post-default-images/default_avatar.jpg' />"  +
      "</div>" +
      "<div class='comment-body' >" + 
        " <header class='clearfix' >" + 
          " <span class='comment-author pull-left'>" + comment.author_name + "</span>" +
          " <span class='comment-date pull-right'>" + formatDate(comment.comment_date) + "</span>" +
        "</header>" +
        " <div class='comment-content' >" + comment.content +
        " </div>" + 
        " <footer>" +

          "<span><i class='fa fa-thumbs-o-up'></i> <span class='like-count'>0</span></span>" +
          "<span><i class='fa fa-thumbs-o-down'></i>  <span class='like-count'>0</span></span>" +
          "<span class='comment-reply'><i class='fa fa-comment-o'></i>   Reply</span>" +
        " </footer>" + 
      "</div>" + 
    "</div>" + 
  "</div>";
  return html;
}

// Comments renderer
function renderComment(depth, replies, results) {
  var html = '';

  replies.forEach(function(e, i, r) {
    var a = _.groupBy(results, function(r){return r.comment_parent === e.id.toString(); });
    if (depth === 0 && _.isEmpty(a['true'])) {
      html += "<li class='item comment'>" + commentTemplate(e) + "</li>";

    } else if (depth > 0 &&  _.isEmpty(a['true'])) {
      html += "<li class='item comment'>" + commentTemplate(e) + "</li>";

    } else if (!_.isEmpty(a['true'])) {
      depth += 1;
      html += "<li class='item comment'>" + 
        commentTemplate(e) + 
        " <ul class='replies depth-" + depth + "'>" + 
        renderComment(depth, a['true'], a['false']) +
        " </ul>" +
      " </li>";
    } 
  });

  return html;
}

// Render the comments
Comment.render = function(k, v, callback) {
  db.where(table, null, k + "=$1 AND approved=$2", [v, 'Approved'], 'comment_date', 'DESC', function(comments){
    if (_.isEmpty(comments)) {
      return callback(false);
    } else {
      var a = _.groupBy(comments, function(c){return c.comment_parent === null; });
      return callback(renderComment(0, a['true'], a['false']));
    }
  });  
}

module.exports = Comment;