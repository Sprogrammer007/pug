var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , SurveyPage = require('./survey_page')
  , _ = require('underscore');

var table = 'surveys';

function Survey () {
  this.update = function(params) {
   
  }
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
  p['status'] = 'Unpublished';
  db.create(table, p, null, function(s) {
    s = Base.convertObject(new Survey(), s);
    SurveyPage.create({},s.id, function(p) {
      s.pages.push(p);
      return callback(s);
    });

  });
};

Survey.all = function(userid, callback) {
  db.findBy(table, null, 'user_id', userid, function(surveys) {
    return callback(Serializer.unserialize(surveys));  
  });
};

Survey.update = function(id, p, callback) {
  db.update(table, p, id, function(s) {
    return callback(Base.convertObject(new Survey(), s[0]));
  });
};

module.exports = Survey;