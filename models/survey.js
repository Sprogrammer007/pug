var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , SurveyPage = require('./survey_page')
  , _ = require('underscore');

var table = 'surveys';

function Survey () {
  this.pages = [];
};

Survey.inherits(Base);

Survey.findBy = function(k, v, callback) {
  db.findBy(table, null, k, v, function(survey) {
    var s = Base.convertObject(new Survey(), survey[0]);   
    SurveyPage.findAllBy('survey_id', s.id, function(pages) {
      s.pages = pages
      return callback(s);
    });
  });
};

Survey.create = function(p, uid, callback) {
  p['user_id'] = uid;
  p['token'] = generateToken(p);
  p['status'] = 'Incomplete';
  db.create(table, p, null, function(s) {
    s = Base.convertObject(new Survey(), s);
    SurveyPage.create({}, s.id, function(pages) {
      s.pages.push(pages.toJson());
      Survey.increment(s.id, 'page_count');
      return callback(s);
    });

  });
};

Survey.all = function(userid, callback) {
  db.findBy(table, null, 'user_id', userid, function(surveys) {
    return callback(Serializer.unserialize(surveys));  
  });
};

Survey.increment = function(id, col, count) {
  count = count || 1;
  var query = "UPDATE surveys SET " + col + "=" + col + " + " + count +
  " WHERE id=" + id + ";";

  db.rawQuery(query, function(r) {
    return r;
  });
};

Survey.decrement = function(id, col, count) {
  var query = "UPDATE surveys SET " + col + "=" + col + " - " + count +
  " WHERE id = " + id + " AND " + col + " >= " + count + ";";

  db.rawQuery(query, function(r) {
    return r;
  });
};

Survey.update = function(id, p, callback) {
  db.update(table, p, id, function(s) {
    return callback(Base.convertObject(new Survey(), s[0]));
  });
};

function generateToken(p) {
  var n = p['name'].replace(/ /g,'');
  var l = (n.length > 6) ? 6 : n;
  return n.substring(0, l).toUpperCase() + _.now() ;
}

module.exports = Survey;