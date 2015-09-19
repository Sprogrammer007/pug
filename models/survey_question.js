var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , SurveyResponse = require('./survey_response')
  , _ = require('underscore');

var table = 'survey_questions';

function SurveyQuestion () {
  this.update = function(params, callback) {
    params.answers = Serializer.serialize(params.answers);
    params.rating = Serializer.serialize(params.rating);
    db.update(table, params, this.id, function(q) {
      if (q) { return callback(true);}
      return callback(false);
    }); 
  }
};

SurveyQuestion.inherits(Base);

SurveyQuestion.findBy = function(k, v, callback) {
  db.findBy(table, null, k, v, function(q) {
    return callback(Base.convertObject(new SurveyQuestion(), q[0]));
  });
};

SurveyQuestion.findAllBy = function(k, v, callback) {
  db.where(table, null,  k+'=$1', v, 'position', 'ASC', function(qs) {
    var a = _.map(qs, function(q) {
      q.answers = _.values(Serializer.unserialize(q.answers));
      q.rating = Serializer.unserialize(q.rating);

      return Base.convertObject(new SurveyQuestion(), q);

    });
    return (callback) ? callback(a) : a;
  });
};

SurveyQuestion.getAllResponse = function(survey_id, callback) {
  SurveyQuestion.findAllBy('survey_id', survey_id, function(qs){
    SurveyResponse.getAllResponse(survey_id, qs, function(result) {
      return callback(result);
    });
  });
};

SurveyQuestion.create = function(p, survey_id, callback) {
  var p = _.defaults(p, {multi_answers: false, required: false});
  p['survey_id'] = survey_id;
  p['answers'] = Serializer.serialize(p.answers);
  p['rating'] = Serializer.serialize(p.rating);
  
  var query = "SELECT DISTINCT ON (position)" + 
    " last_value(position) OVER wnd" + 
    " FROM survey_questions WHERE survey_page_id=" +  p.survey_page_id + " AND parent_question IS NULL" +
    " WINDOW wnd AS ( ORDER BY position ASC" +
    " ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING);"
  db.rawQuery(query, function(maxP) {
    var pos =  _.isEmpty(maxP) ? 0 : _.first(maxP).last_value;
    p['position'] = parseInt(pos) + 1;
    db.create(table, p, null, function(q) {
      q.answers = Serializer.unserialize(q.answers);
      q.ratings = Serializer.unserialize(q.rating);
      return callback(Base.convertObject(new SurveyQuestion(), q));
    });
  });
};

SurveyQuestion.updatePositions = function(data, callback) {
  var a = _.map(data, function(e, k) {
    return _.map(e, function(e, i) {
      return ("(" + e + ", " + i + ", " + parseInt(k) + ")");
    });
  });
  a = _.flatten(a);
  var query = "UPDATE " + table + " AS T SET" +
  " position = c.col_a, survey_page_id = c.col_c FROM (VALUES " + 
  a.join(", ") + " ) AS c(col_b, col_a, col_c)" +
  " WHERE c.col_b = t.id;"
  return db.rawQuery(query, function(r) {
    return callback(r);
  });  
}


SurveyQuestion.destroy = function(id, callback) {
  db.destroy(table, 'id', id, function(r) {
    return callback(r);
  });
};


module.exports = SurveyQuestion;
