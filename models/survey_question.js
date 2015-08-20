var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , _ = require('underscore');

var table = 'survey_questions';

function SurveyQuestion () {
  this.update = function() {
   
  }
};


SurveyQuestion.inherits(Base);

SurveyQuestion.findBy = function(k, v, callback) {
  db.findBy(table, null, k, v, function(q) {
    q = Base.convertObject(new SurveyQuestion(), q);    
    return callback(s);
  });
};

SurveyQuestion.findAllBy = function(k,v, callback) {
  db.findBy(table, null, k, v, function(qs) {
    var a = _.map(qs, function(q) {
      q.answers = _.values(Serializer.unserialize(q.answers));
      q.rating = Serializer.unserialize(q.rating);

      return Base.convertObject(new SurveyQuestion(), q);

    });
    return (callback) ? callback(a) : a;
  });
};

SurveyQuestion.create = function(p, survey_id, callback) {
  p['survey_id'] = survey_id;
  p['answers'] = Serializer.serialize(p.answers);
  p['rating'] = Serializer.serialize(p.rating);

  db.create(table, p, null, function(q) {
    q.answers = Serializer.unserialize(q.answers);
    q.ratings = Serializer.unserialize(q.rating);
    return callback(Base.convertObject(new SurveyQuestion(), q));
  });
};

module.exports = SurveyQuestion;
