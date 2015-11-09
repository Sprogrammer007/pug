;(function () {
  "user strict"
  
  angular.module("pug")
  .factory("Survey", function SurveyFactory($resource) {
    return $resource("/api/s/:id", {id: '@id'}, {
      'update': { method: 'PUT', params: {}},
      'updateStatus': { 
        method: 'PUT',
        url: "/api/s/:id/status"
      }
    });
  }); 

  angular.module("pug")
  .factory("SurveyPage", function SurveyPageFactory($resource) {
    return $resource("/api/s/:survey_id/p/:id", {}, {});
  });

  angular.module("pug")
  .factory("Question", function QuestionFactory($resource) {
    return $resource("/api/s/:survey_id/q/:id", {}, {
      'update': { method: 'PUT' }
    });
  });

  angular.module("pug")
  .factory("QPosition", function QPositionFactory($http) {
    return { 
      update: function(data) {
        return $http.post("/api/s/qo", data).then(function(r) {
          return r.data.success
        });
      }
    };
  });  

  angular.module("pug")
  .factory("Response", function ResponseFactory($resource) {
    return $resource("/api/r/:id", {}, {
      all: { 
        method: 'GET', 
        url: "/api/r/:id/all", 
        isArray: true
      },
      counts: {
        method: 'GET', 
        url: "/api/r/:id/counts"
      }
    });
  });

  angular.module("pug")
  .service('TextAnalyze', function() {
    function analyzer(text) {
      var sWords = text.toLowerCase().trim().replace(/[,;.]/g,'').split(/[\s\/]+/g).sort();          

      // array of words to ignore
      var ignores = ['and','the','to','a','of','for','as','i',
      'with','it','is','on','that','this','can','in','be','has','if'];

      var counts = {}; // object for math
      for (var i=0; i<sWords.length; i++) {
        if (ignores.indexOf(sWords[i]) > -1) { continue }
        counts[sWords[i]] = counts[sWords[i]] || 0;
        counts[sWords[i]]++;
      }

      var arr = []; // an array of objects to return
      for (sWord in counts) {
        arr.push({
          text: sWord,
          frequency: counts[sWord]
        });
      }

      arr.sort(function(a,b){
        return (a.frequency > b.frequency) ? -1 : ((a.frequency < b.frequency) ? 1 : 0);
      });
      return arr;
    }
    return {
      analyze: function(text) {
        var result = analyzer(text.join(' '));
        return result;
      }
    };
  });


})();