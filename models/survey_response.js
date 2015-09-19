var DBManager = require('../modules/database-manager')
  , db = new DBManager()
  , Base = require('./base')
  , moment = require('moment')
  , Serializer = require('node-serialize')
  , _ = require('underscore');

var table = 'survey_responses';

function SurveyResponse () {

};

SurveyResponse.inherits(Base);

SurveyResponse.findBy = function(k, v, callback) {
  db.findBy(table, 'answers', k, v, function(q) {
    return callback(Base.convertObject(new SurveyResponse(), q[0]));
  });
};

SurveyResponse.allCounts = function(user_id, query, callback) {
  var startDate = moment(new Date(query['startDate']))
    , endDate = moment(new Date(query['endDate']));
  var where = 'user_id=$1 AND response_date<=$2 AND response_date>=$3';
  var values = [user_id, 
    startDate.format('YYYY-MM-DD'),  
    endDate.format('YYYY-MM-DD')];
  db.where(table, 'response_date', where, values, 'response_date', 'DESC', function(res) {
    res = _.chain(res).pluck('response_date');
    var data = prepareCountData(startDate, endDate, res);
    return  callback(data);
  });
};

SurveyResponse.getAllResponse = function(survey_id, qs, callback) {
  db.findBy(table, 'answers', 'survey_id', survey_id, function(res) {
    res = _.chain(res).pluck('answers');
       
    qs.forEach(function(q, i, l){
      var qrs = res.pluck(q.id).compact();
      if (qrs.isEmpty().value()) {
        q.responses =  undefined;
      } else {
        q.responses = prepareResponse(q.type, q, qrs);
      }
    });
    return  callback(qs)
  });
};

SurveyResponse.create = function(p, survey_id, callback) {

};

SurveyResponse.destroy = function(id, callback) {
  db.destroy(table, 'id', id, function(r) {
    return callback(r);
  });
};

function responseCount(res, day) {
  return res.filter(function(date) { 
    return moment(date).isSame(day, 'day') 
  }).size().value();
}
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
}

function prepareResponse(type, q, responses) {
  var z = {total: responses.size().value()};
  var answers = q.answers;
  if (['MC', 'YN', 'DD'].indexOf(type) > -1) {
    prepareData(responses, answers, z, z.total);
  };

  if (['SA', 'LA', 'NA'].indexOf(type) > -1) { 
    z.data = responses.value()
  }

  if (type === 'CONTACT') {
    _.each(answers, function(a, i, l) {
      z.data = {};
      z.data[a] = responses.pluck(a).value();
    });
  }

  if (type === 'MRS') {
    var subqs = q.rating.subqs;
    var ratings = q.rating.ratings;
    z.subqs = {};
    _.each(subqs, function(subq, i, l) { 
      var subqres = responses.pluck(subq.id);
      z.subqs[subq.id] = {};
      prepareData(subqres, ratings, z.subqs[subq.id], z.total);
    });
  }
  return z
};

function prepareData(responses, answers, object, total) {
  if (_.isObject(answers)) {
    answers = _.toArray(answers);
  }
  object.data = [];
  var counts = responses.countBy(function(v, k, i) {
    for (i = 0; i < answers.length; i++) {
      if (answers[i].id === v) {return answers[i].id}
    }
  });
  counts = counts.value();
  _.each(answers, function(a, i, l) {
    object[a.value.toString()] = (counts[a.id] || 0);
    object.data.push({c: [{v: a.value}, {v:  (calcPercentage(counts[a.id], total) || 0)}]});
  });
  return object;
}

function calcPercentage(num, total) {
  return Math.round((num/total) * 100);
}

module.exports = SurveyResponse;
