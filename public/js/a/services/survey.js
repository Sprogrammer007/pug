;(function () {
  angular.module("dfr")
  .factory("Survey", function SurveyFactory($http) {
    return {
      get: function(callback) {
        var survey;
        $http.get('g')
        .success(function(result) {
          survey = result;
            return callback(null, survey);
        });
      }
    }
  });


})();