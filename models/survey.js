var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , Serializer = require('node-serialize')
  , SurveyPage = require('./survey_page')
  , _ = require('underscore');

var table = 'surveys';

function Survey () {
  this.isPublished = function() {
    return this.status === 'Published';
  };

  this.pages = [];
};


Survey.findBy = function(k, v, done, convert, raw) {
  db.findBy(table, null, k, v, function(err, survey) {
    if (err || _.isEmpty(survey)) { return done(true)  };
    survey = (convert) ? Base.convertObject(new Survey(), _.first(survey)) : _.first(survey); 
    if (!raw) {
      SurveyPage.findAllBy('survey_id', survey.id, function(err, pages) {
        survey.pages = pages
        return done(false, survey);
      });
    } else {
      return done(false, survey);
    } 
  });
};

Survey.create = function(p, uid, done) {
  p['user_id'] = uid;
  p['status'] = 'Incomplete';
  p['token'] = Base.generateToken(8);
  p['page_count'] = 1;
  db.create(table, p, null, function(err, s) {
    s = _.first(s)
    if (err) { return done(err) };
    SurveyPage.create({}, s.id, function(err, page) {
      s.pages = [];
      s.pages.push(page);
      return done(false, s);
    });
  });
};

Survey.update = function(p, id, done) {
  if (p.status === 'Archived') { return done(true) };
  db.update(table, p, id, function(err, s) {
    if (err) { return done(err) };
    return done(false, true);
  });
};

Survey.all = function(userid, done) {
  db.where(table, null, 'user_id=$1 AND status!=$2', 
    [userid, 'Archived'], "id", 'ASC', function(err, surveys) {
    if (err) { return done(err) };
    return done(false, surveys);  
  });
};

Survey.increment = function(id, col, count) {
  count = count || 1;
  var query = "UPDATE surveys SET " + col + "=" + col + " + " + count +
  " WHERE id=" + id + ";";

  return db.rawQuery(query);
};

Survey.decrement = function(id, col, count) {
  var query = "UPDATE surveys SET " + col + "=" + col + " - " + count +
  " WHERE id = " + id + " AND " + col + " >= " + count + ";";
  return db.rawQuery(query);
};


Survey.toggleStatus = function(id, p, done) {

  var newStatus = p.new_status
    , errors = [];

  if (newStatus === 'Published') {

    if (_.isEmpty(p.survey.pages)) { 
      errors.push('No Pages Found For Survey.'); 
    } else {
      _.each(p.survey.pages, function(page, pi, a) {
        if(_.isEmpty(page.questions)) {
          errors.push('Page #' + (pi+1) + ' has no questions.');
        } else {

          _.each(page.questions, function(q, i, a) {
            if (_.contains(['MC', 'SC', 'DD'], q.type)) {
              if (_.isEmpty(q.choices)) {
                errors.push('Question #' + (q.position + 1) + ' on Page #' + (pi+1) + ' requires choices.');
              }
            };

            if (_.contains(['MRS', 'SRS'], q.type)) {
              if (_.isEmpty(q.choices.ratings)) {
                errors.push('Question #' + (q.position + 1) + ' on Page #' + (pi+1) + ' requires ratings.');
              }
              if (_.isEmpty(q.choices.subqs) && q.type === 'MRS') {
                errors.push('Question #' + (q.position + 1) + ' on Page #' + (pi+1) + ' requires sub questions.');
              }
            }
          });
        }

      });
    }
  };
  if (!_.isEmpty(errors)) {
    return done({success: false, message: errors}) 
  };

  db.update(table, {status: newStatus}, id, function(err, s) {
    if (err) { return done(err) };
    return done(false, _.first(s)); 
  });
};


module.exports = Survey;