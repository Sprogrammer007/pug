var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Serializer = require('node-serialize')
  , bcrypt = require('bcrypt-nodejs')
  , _ = require('underscore');

var table = 'survey_questions';

function dbToObject(o, db) {
  for (var key in db) {  
    if (db.hasOwnProperty(key)) {
      o[key] = db[key];
    }
  }
  return o;
}

function SurveyQuestion () {
  this.update = function(params) {
   
  }
};

SurveyQuestion.findBy = function(k, v, callback) {
  db.findBy(table, null, k, v, function(survey) {
    var s = dbToObject(new Survey(), survey);
    SurveyPage.findAllBy('survey_id', survey.id, function(pages) {
      s.pages = pages
      return callback(s);
    });
  });
};

SurveyQuestion.create = function(p, survey_id, callback) {
  p['survey_id'] = survey_id;
  p['answers'] = _.isObject(p.answers) ? Serializer.serialize(p.answers) : p.answers;
  p['ratings'] = _.isObject(p.ratings) ? Serializer.serialize(p.ratings) : p.ratings;

  db.create(table, p, null, function(q) {
    q.answers = Serializer.unserialize(q.answers);
    q.ratings = Serializer.unserialize(q.ratings);
    return callback(dbToObject(new SurveyQuestion(), q));
  });
};

module.exports = SurveyQuestion;
