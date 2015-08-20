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

Survey.create = function(p) {

};

Survey.all = function() {

};

Survey.update = function(id, categories) {

};

module.exports = Survey;