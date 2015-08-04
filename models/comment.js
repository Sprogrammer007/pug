var dbManager = require('../modules/database-manager')
  , moment = require('moment')
  , Post = require('./Post')
  , _ = require('underscore');

function dbToObject(o, db) {

  for (var key in db) {  
    if (db.hasOwnProperty(key)) {
      o[key] = db[key];
    }
  }

  return o;
}

function formatDate(date) {
  var day = moment(date).format('YYYYMMDDHHmmss')
  return moment(day, "YYYYMMDDHHmmss").fromNow();
}

function Comment() {
  this.replies = function() {
    // TODO run query to get replies for comment
    return true;
  };

  this.destroy = function() {
    dbManager.destroy('comments', 'id', this.id);
  };

  this.update = function(params) {
    dbManager.update('comments', params, this.id)
  };

  this.updatePostCommentCount = function() {
    Post.incrementCommentCount(this.post_id);
  };
};

Comment.findBy = function(k, v) {
  var comment;
  dbManager.findBy('comments', k, v, function(error, result) {
    comment = result[0];
  });
  comment = dbToObject(new Comment(), comment);

  return comment;
}

Comment.create = function(ip, params, user_id) {

  if (params['content'] === '' ) {return false};
  params['approved'] = 'Pending';
  if (params['comment_parent']) {params['comment_parent'] = parseInt(params.comment_parent)};
  params['author_ip'] = ip;
  if (user_id) {
    params['user_id'] = user_id;
  }

  var comment = dbToObject(new Comment(), dbManager.create('comments', params, null));
  return comment;
}

Comment.all = function() {
  var cs = [];
  _.map(dbManager.all('comments', 'comment_date', 'DESC'), function(c){
    comment = dbToObject(new Comment(), c);
    cs.push(comment);
  });
  return cs;
}

function commentTemplate (comment) {
  var html = '<div id="comment-' + comment.id + '" class="comment-wrapper" >' +
    ((comment.comment_parent != null) ? "<span class='arrow-up'></span>" : "") +
    "<div class='comment-avatar pull-left'>" +
      "<div class='avatar'>"  +
        "<img src='//s3.amazonaws.com/designforresult/post-default-images/default_avatar.jpg' />"  +
      "</div>" +
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
  "</div>";
  return html;
}



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


Comment.render = function(k, v) {
  var query = "SELECT * FROM comments WHERE " + k + "=" + v + " AND approved='Approved' ORDER BY comment_date DESC;" 

  var results = dbManager.rawQuery(query);  
  if (_.isEmpty(results)) {return false};
  var a = _.groupBy(results, function(r){return r.comment_parent === null; });
  return renderComment(0, a['true'], a['false']);

}

module.exports = Comment;