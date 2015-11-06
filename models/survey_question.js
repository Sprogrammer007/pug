var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , SurveyResponse = require('./survey_response')
  , _ = require('underscore');

var table = 'survey_questions';

function SurveyQuestion () {};


SurveyQuestion.findBy = function(k, v, done) {
  db.findBy(table, null, k, v, function(err, q) {
    if (err) { return done(err) };
    return done(_.first(q));
  });
};

SurveyQuestion.findAllBy = function(k, v, done) {
  db.where(table, null,  k+'=$1', v, 'position', 'ASC', function(err, qs) {
    if (err) { return done(err) };
    qs = _.each(qs, function(q) {
      if (['MC', 'SC', 'DD'].indexOf(q.type) > 0) { 
        q.choices =  _.values(q.choices);
      };
    });
    return (done) ? done(false, qs) : qs;
  });
};

SurveyQuestion.getAllResponse = function(survey_id, done) {
  SurveyQuestion.findAllBy('survey_id', survey_id, function(err, qs){
    SurveyResponse.getAllResponse(survey_id, qs, function(err, rs) {
      if (err) { return done(err) };
      return done(false, rs);
    });
  });
};

SurveyQuestion.moveToPage = function(oldPage, newPage, pos, done) {
  var query = "UPDATE " + table + " SET survey_page_id=" + newPage + 
  ", position=position + " + (parseInt(pos) + 1) + 
  " WHERE survey_page_id=" + oldPage + ";"
  db.rawQuery(query) 
};

SurveyQuestion.create = function(p, survey_id, done) {
  var p = _.defaults(p, {required: false, allow_other: false});
  p.survey_id = survey_id;
  p.choices = Serializer.serialize(p.choices);

  var query = "SELECT DISTINCT ON (position)" + 
    " last_value(position) OVER wnd" + 
    " FROM survey_questions WHERE survey_page_id=" +  p.survey_page_id + " AND parent_question IS NULL" +
    " WINDOW wnd AS ( ORDER BY position ASC" +
    " ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING);"
  db.rawQuery(query, function(err, maxP) {
    var pos =  _.isEmpty(maxP) ? 0 : _.first(maxP).last_value;
    p.position = parseInt(pos) + 1;
    db.create(table, p, null, function(q) {
      if (err) { return done(err) };
      return done(false, q);
    });
  });
};

SurveyQuestion.update = function(params, id, done) {
  db.update(table, params, id, function(err, q) {
    if (err) { return done(err) };
    return done(false);
  }); 
};

SurveyQuestion.updatePositions = function(data, done) {
  var a = _.map(data, function(e, k) {
    return _.map(e, function(v, i) {
      return ("(" + v + ", " + i + ", " + parseInt(k) + ")");
    });
  });
  a = _.flatten(a);
  var query = "UPDATE " + table + " AS T SET" +
  " position = c.col_a, survey_page_id = c.col_c FROM (VALUES " + 
  a.join(", ") + " ) AS c(col_b, col_a, col_c)" +
  " WHERE c.col_b = t.id;"
  return db.rawQuery(query, function(err, r) {
    if (err) { return done(err) };
    return done(false, r);
  });  
}


SurveyQuestion.destroy = function(c, v, done) {
  db.destroy(table, c, v, function(err, r) {
    if (err) { return done(err) };
    return done(false, r);
  });
};


module.exports = SurveyQuestion;
