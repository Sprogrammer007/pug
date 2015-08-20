;(function () {
  angular.module("dfr")
  .factory("Survey", function SurveyFactory($resource) {
    return $resource("/campaign/s/:id", {}, {});
  }); 

  angular.module("dfr")
  .factory("SurveyPage", function SurveyPageFactory($resource) {
    return $resource("/campaign/s/:survey_id/p/:id", {}, {});
  });


  angular.module("dfr")
  .factory("Question", function QuestionFactory($resource) {
    return $resource("/campaign/s/:survey_id/q/:id", {}, {});
  });


})();