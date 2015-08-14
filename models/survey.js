var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Serializer = require('node-serialize')
  , bcrypt = require('bcrypt-nodejs')
  , SurveyPage = require('./survey_page')
  , _ = require('underscore');

var table = 'surveys';

function dbToObject(o, db) {
  for (var key in db) {  
    if (db.hasOwnProperty(key)) {
      o[key] = db[key];
    }
  }
  return o;
}

function Survey () {
  this.update = function(params) {
   
  }
};

Survey.findBy = function(k, v, callback) {
  db.findBy(table, null, k, v, function(survey) {
    var s = dbToObject(new Survey(), survey[0]);
    SurveyPage.findAllBy('survey_id', s.id, function(pages) {
      s.pages = pages
      return callback(s);
    });
  });
};

Survey.create = function(p) {
  var survey = dbToObject(new Survey(), dbManager.create('surveys', p, null));
  SurveyPage.create({survey_id: survey.id}); 
  return survey;
};

Survey.all = function() {

};

Survey.update = function(id, categories) {

};

module.exports = Survey;