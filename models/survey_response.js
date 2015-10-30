var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , moment = require('moment')
  , Serializer = require('node-serialize')
  , _ = require('underscore');

var table = 'survey_responses';

function SurveyResponse () {};

SurveyResponse.findBy = function(k, v, done) {
  db.findBy(table, 'answers', k, v, function(err, r) {
    if (err) { return done(err) };
    return done(false, _.first(r));
  });
};

SurveyResponse.allCounts = function(user_id, query, done) {
  var startDate = moment(new Date(query['startDate']))
    , endDate = moment(new Date(query['endDate']));
  var where = 'user_id=$1 AND response_date::DATE<=$2 AND response_date::DATE>=$3';
  var values = [user_id, 
    startDate.format('YYYY-MM-DD'),  
    endDate.format('YYYY-MM-DD')];

  db.where(table, 'response_date', where, values, 'response_date', 'DESC', function(err, res) {
    if (err) { return done(err) };
    res = _.chain(res).pluck('response_date');

    var data = prepareCountData(startDate, endDate, res);
    return  done(false, data);
  });
};

function responseCount(res, day) {
  return res.filter(function(date) { 
    return moment(date).isSame(day, 'day') 
  }).size().value();
};

function prepareCountData(startDate, endDate, res) {
  var numDates = startDate.diff(endDate, 'days');
  var totalDays = numDates;
  var data = [];
  var series = {};
  for (i = totalDays; i >= 0 ; i--) {
    var day = startDate.subtract((i === totalDays) ? 0 : 1, 'days');
    var count = responseCount(res, day);
    data.push({c: [{v: "Date(" + day.toArray().slice(0, 3).join(", ") + ")"}, {v: count}]});
  }
  return {total: res.size().value(), series: series, data: data}
};

SurveyResponse.getAllResponse = function(survey_id, qs, done) {
  db.findBy(table, 'answers', 'survey_id', survey_id, function(err, res) {
    if (err) { return done(err) };
    res = _.chain(res).pluck('answers');
       
    qs.forEach(function(q, i, l){
      var qrs = res.pluck("Q" + q.id).compact();
      if (qrs.isEmpty().value()) {
        q.responses =  undefined;
      } else {
        q.responses = prepareResponse(q.type, q, qrs);
      }
    });
    return done(false, qs)
  });
};

SurveyResponse.create = function(survey, p, done) {
  p['survey_id'] = survey.id;
  p['user_id'] = survey.user_id;
  db.create(table, p, null, function(err, r) {
    if (err) { return done(err) };
    return done(false, {thank_url: survey.thank_url, thank_msg: survey.thank_msg});
  });
};

SurveyResponse.destroy = function(id, done) {
  db.destroy(table, 'id', id, function(err, r) {
    if (err) { return done(err) };
    return done(false);
  });
};



function prepareResponse(type, q, responses) {
  var z = {total: responses.size().value()};
  var choices = q.choices;
  if (['MC', 'SC', 'DD', 'SRS'].indexOf(type) > -1) {
    if (type === 'SRS') {
      choices = choices.ratings;
    }
    prepareData(responses, choices, z, z.total);
  };

  if (['SA', 'LA'].indexOf(type) > -1) { 
    z.data = responses.value()
  }

  if (type === 'CONTACT') {
    _.each(choices, function(a, i, l) {
      z.data = {};
      z.data[a] = responses.pluck(a).value();
    });
  }

  if (type === 'MRS') {
    var subqs = q.choices.subqs;
    var ratings = q.choices.ratings;
    z.subqs = {};
    _.each(subqs, function(subq, i, l) { 
      var subqres = responses.pluck(subq.id);
      z.subqs[subq.id] = {};
      prepareData(subqres, ratings, z.subqs[subq.id], z.total);
    });
  }
  return z
};

function prepareData(responses, choices, object, total) {
  if (_.isObject(choices)) {
    choices = _.toArray(choices);
  }
  object.data = [];
  var counts = responses.countBy(function(v, k, i) {
    for (i = 0; i < choices.length; i++) {
      if (choices[i].id === v) {return choices[i].id}
    }
  });
  counts = counts.value();
  _.each(choices, function(c, i, l) {
    object[c.value.toString()] = (counts[c.id] || 0);
    object.data.push({c: [{v: c.value}, {v:  (calcPercentage(counts[c.id], total) || 0)}]});
  });
  return object;
}

function calcPercentage(num, total) {
  return Math.round((num/total) * 100);
}



module.exports = SurveyResponse;
