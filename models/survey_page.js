var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , SurveyQuestion = require('./survey_question')
  , _ = require('underscore');

var table = 'survey_pages'


function SurveyPage () {
  this.update = function(){

  }
}

SurveyPage.inherits(Base);

SurveyPage.create = function(p, id, callback) {
  p.survey_id = id;
  var p = _.defaults(p, {type: "Questionaire"});
  db.create(table, p, null, function(sp) {
    return callback(Base.convertObject(new SurveyPage(), sp));
  });
};

SurveyPage.findBy = function(k, v, callback) {

};  

SurveyPage.all = function() {

};

SurveyPage.findAllBy = function(k,v, callback) {
  db.findBy(table, null, k, v, function(pages) {
    var ps = [];
    if (!_.isEmpty(pages)) {
      _.each(pages, function(p, i, a) {
        p = Base.convertObject(new SurveyPage(), p);
        SurveyQuestion.findAllBy('survey_page_id', p.id, function(qs){
          p.questions =  qs;
          ps.push(p)
          if (ps.length === a.length) {callback(ps)}
        });
      });
    } else {
      return callback(ps);
    }
  });
};


SurveyPage.update = function(id, categories) {

};

module.exports = SurveyPage;