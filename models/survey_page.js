var dbManager = require('../modules/database-manager')
    , Serializer = require('node-serialize')
    , bcrypt = require('bcrypt-nodejs')
    , _ = require('underscore');



function dbToObject(o, db) {
  for (var key in db) {  
    if (db.hasOwnProperty(key)) {
      o[key] = db[key];
    }
  }

  return o;
}

function SurveyPage () {
  this.update = function(params) {
   
  }
}

SurveyPage.create = function(p) {
  var p = _.defaults(p, {type: "Questionaire", position: "1"});
  return dbToObject(new SurveyPage(), dbManager.create('survey_pages', p, null));
};

SurveyPage.findBy = function() {

};

SurveyPage.all = function() {

};

SurveyPage.findAllBy = function(k,v) {
  return dbManager.findAllBy('survey_pages', null, k, v)
};

SurveyPage.update = function(id, categories) {

};

module.exports = SurveyPage;