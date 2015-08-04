var dbManager = require('../modules/database-manager')
    , Serializer = require('node-serialize')
    , bcrypt = require('bcrypt-nodejs')
    , SurveyPage = require('./survey_page')
    , _ = require('underscore');

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

Survey.findBy = function(k, v) {
  var survey;
  dbManager.findBy('surveys', k, v, function(error, result) {
    survey = result[0];
  });
  survey = dbToObject(new Survey(), survey);
  survey.pages = SurveyPage.findAllBy('survey_id', survey.id);
  return survey;
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