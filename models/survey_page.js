var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Serializer = require('node-serialize')
  , bcrypt = require('bcrypt-nodejs')
  , _ = require('underscore');

var table = 'survey_pages'

function dbToObject(o, db) {
  for (var key in db) {  
    if (db.hasOwnProperty(key)) {
      o[key] = db[key];
    }
  }

  return o;
}

function SurveyPage () {
 
}

SurveyPage.create = function(p) {
  var p = _.defaults(p, {type: "Questionaire", position: "1"});
  return dbToObject(new SurveyPage(), dbManager.create('survey_pages', p, null));
};

SurveyPage.findBy = function(k, v, callback) {

};  

SurveyPage.all = function() {

};

SurveyPage.findAllBy = function(k,v, callback) {
  db.findBy(table, null, k, v, function(pages) {
    var a = [];
    _.map(pages, function(p) {
      a.push(dbToObject(new SurveyPage(), p));
    });
    return callback(a); 
  });
};

SurveyPage.update = function(id, categories) {

};

module.exports = SurveyPage;