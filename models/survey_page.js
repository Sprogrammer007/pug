var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , SurveyQuestion = require('./survey_question')
  , _ = require('underscore');

var table = 'survey_pages'

function SurveyPage () {};

SurveyPage.create = function(p, id, done) {
  p.survey_id = id;
  db.create(table, p, null, function(err, sp) {
    if (err) { return done(err) };
    sp = _.first(sp);
    sp.questions = [];
    return done(false, sp);
  });
};


SurveyPage.findAllBy = function(k,v, done) {
  db.where(table, null, 'survey_id=$1', v, 'id', 'ASC', function(err, pages) {
    if (err) { return done(err) };
    var ps = [];
    if (!_.isEmpty(pages)) {
      _.each(pages, function(p, i, a) {
        SurveyQuestion.findAllBy('survey_page_id', p.id, function(err, qs){
          p.questions =  qs;
          ps.push(p)
          if (ps.length === a.length) {done(false, ps)}
        });
      });
    } else {
      return done(true);
    }
  });
};

SurveyPage.destroy = function(c, v, query, done) {  
  if (query.newPage) {
    SurveyQuestion.moveToPage(v, query.newPage, query.maxPos);
  } else if (query.count > 0 ) {
    SurveyQuestion.destroy('survey_page_id', v, function(err, r) {});
  }
  db.destroy(table, c, v, function(err, r) {
    if (err) { return done(err) };
    return done(false);
  });
};


module.exports = SurveyPage;