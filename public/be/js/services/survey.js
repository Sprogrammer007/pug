;(function () {
  "user strict"
  
  angular.module("dfr")
  .factory("Survey", function SurveyFactory($resource) {
    return $resource("/campaign/s/:id", {id: '@id'}, {
      'update': { method: 'PUT', params: {}}
    });
  }); 

  angular.module("dfr")
  .factory("SurveyPage", function SurveyPageFactory($resource) {
    return $resource("/campaign/s/:survey_id/p/:id", {}, {});
  });


  angular.module("dfr")
  .factory("Question", function QuestionFactory($resource) {
    return $resource("/campaign/s/:survey_id/q/:id", {}, {
      'update': { method: 'PUT' }
    });
  });

  angular.module("dfr")
  .factory("QPosition", function QPositionFactory($http) {
    return { 
      update: function(data) {
        return $http.post("/campaign/s/qo", data).then(function(r) {
          return r.data.success
        });
      }
    };
  });  

  angular.module("dfr")
  .factory("Response", function ResponseFactory($resource) {
    return $resource("/campaign/r/:id", {}, {
      all: { 
        method: 'GET', 
        url: "/campaign/r/:id/all", 
        isArray: true
      },
      counts: {
        method: 'GET', 
        url: "/campaign/r/:id/counts"
      }
    });
  });

})();