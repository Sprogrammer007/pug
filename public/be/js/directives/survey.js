;(function() {
  
  var sd = angular.module('dfrSurveysDirectives', [])
  
  sd.directive('surveyDash', function(Survey, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'SurveyDash',
      transclude: true,
      scope: {
        loaded: '=',
        sid: '=',
        mainCtrl: '='
      },
      link: function(scope, element) {     
        if (scope.sid) {
          Survey.get({id: scope.sid }).$promise.then(function(survey) {
            $timeout(function() {
              scope.survey = survey;
              scope.loaded = true;
            }, 1500);
          });
        } else {
          Survey.query(function(surveys) {
            $timeout(function() {
              scope.surveys = surveys;
              scope.loaded = true;
            }, 1500);
          });
        }
    
      },
      controller: 'SurveyDashController',
      controllerAs: "sdashCtrl"
    }
  });    

  sd.directive('newSurvey', function(Survey, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'NewSurvey',
      link: function(scope, element) {     
        scope.survey = new Survey({start_date: new Date()});

        scope.$watch('survey.schedule', function(n, o) {
          if (n === 'Continuosly' && o === 'Schedule') {
            scope.survey.start_date = new Date();
            scope.survey.end_date = null;
          };
        });

      },
      controller: 'NewSurveyController',
      controllerAs: "nsCtrl"
    }
  });  

  sd.directive('surveyList', function(Survey, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'SurveyList',
      scope: {
        surveys: '=',
        loaded: '='
      },
      link: function(scope, element) {
        scope.selected = [];
        scope.currentOrder = '';
        scope.orderDirection = '';
        scope.massAction = '';
        scope.massActions = ['All Surveys', 'Delete']
        
        scope.orderBy = function(item) {
          var direction = (scope.orderDirection === '+') ? '-' : '+'; 
          scope.orderDirection = direction;
          scope.currentOrder = direction + item;
        };   

        scope.sortDirect = function(direction) {
          return scope.orderDirection === direction;
        };

        scope.sortItem = function(item) {
          return scope.currentOrder.replace(/\+|\-/g,'') === item;
        };

      },
      controller: 'SurveyListController',
      controllerAs: "slistCtrl"
    }
  });
  
  sd.directive('surveyChart', function(Survey, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'SurveyChart',
      scope: {
      },
      link: function(scope, element) {
      },
      controller: 'SurveyChartController',
      controllerAs: 'scCtrl'
    }
  });  

  sd.directive('surveyResults', function(Survey, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'SurveyResults',
      scope: {
      },
      link: function(scope, element) {
      },
      controller: 'SurveyResultsController',
      controllerAs: 'srCtrl'
    }
  });

  sd.directive('surveyEdit', function(Survey, $sce, $filter, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'SurveyEdit',
      scope: {
        survey: '=',
        loaded: '='
      },
      link: function(scope, element) {
        scope.$watch('survey', function(n, o) {
          if (n) {
            scope.surveyDescip = $sce.trustAsHtml(n.description);
          }
        });
       
        scope.editMode = false;
        scope.editState = ' Edit';

        scope.surveySchedule = function() {
          if (angular.isUndefined(scope.survey)) { return }
          var s = scope.survey;
          var startDate = $filter('date')(s.start_date, 'MMM dd, yyyy');
          if (s.schedule === 'Continuosly') {
            return startDate + " -  Ongoing"
          }
          return startDate + " - " + $filter('date')(s.end_date, 'MMM dd, yyyy');
        };
      },
      controller: 'SurveyEditController',
      controllerAs: 'seCtrl'
    }
  });
  
  sd.directive('surveyBuilder', function(Survey, Question, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'SurveyBuilder',
      scope: {
        sid: '=',
        loaded: '='
      },
      link: function(scope, element) {
        scope.question = new Question({ answers: [], rating: { ratings: [] } });
        scope.qPanel = 'Close';
        scope.updateMode = false;
  
        Survey.get({id: scope.sid }).$promise.then(function(survey) {
          $timeout(function() {
            scope.survey = survey;
            scope.loaded = true;
          }, 1500);
        });

        scope.openQuestion = function() {
          return scope.qPanel === 'Open';
        };

        scope.newQuestion = function(pageID) {
          var defaults = {answers: [], rating: { ratings: [] } };
          if (pageID) {defaults.survey_page_id = pageID};
          return new Question(defaults);
        };
      },
      controller: 'SurveyBuilderController',
      controllerAs: "sbCtrl"
    }
  });

  sd.directive('questionForm', function() {
    return {
      restrict: "E",
      templateUrl: 'questionForm',
      scope: {
        q: '=',
        sid: '=',
        um: '=',
        surveyCtrl: '='
      },
      link: function(scope, element) {
        $('.body-content').TrackpadScrollEmulator();

        scope.isInValid = function() {
          var emptyA = scope.q.answers.isEmpty();
          if (scope.qbForm.$invalid) {return true};
          if (['MC', 'DD'].indexOf(scope.q.type) > -1) {
            return emptyA
          };
          if (scope.q.type === 'MRS' && scope.q.rating.type === 'Custom') {
            var emptyR = scope.q.rating.ratings.isEmpty();
            return (emptyA || emptyR)
          };
          return false 
        }
      },
      controller: 'QuestionFormController',
      controllerAs: 'qbCtrl'
    }
  });

  sd.directive('surveyPage', function() {
    return {
      restrict: "E",
      templateUrl: 'surveyPage',
      scope: {
        survey: '=',
        cq: '=',
        sid: '=',
        sbCtrl: '='
      },
      link: function(scope, element) { 
        element.on('mouseenter', '.remove-options', function(e) {
          e.stopPropagation();
        });
        scope.$watch('survey', function(n, o) {
          if (n != undefined) {
            scope.pages = scope.survey.pages
            scope.currentActivePage = scope.pages[0];
          }
        });
      },
      controller: 'SurveyPageController',
      controllerAs: 'pgCtrl'
    }
  });   

  sd.directive('question', function() {
    return {
      restrict: "E",
      templateUrl: 'surveyQuestion',
      controller: 'SurveyQuestionController',
      controllerAs: 'sqCtrl'
    }
  });   

  sd.directive('arBox', function() {
    return {
      restrict: "E",
      templateUrl: 'surveyARBox',
      scope: {
        name: '@',
        value: '=',
        i: '=',
        q: '=',
        removeable: '='
      },

      link: function(scope, element) {
        element.on('click', ".edit-answer, input", function(e) {
          var previous = $(this).parents('.a-list').find('.focus');
          if (previous) { $(previous).removeClass('focus'); }
          var input = $(this).is('input') ? $(this) : $(this).siblings('input')
          var strLength= input.val().length * 2;
          $(this).parent('.answer').addClass('focus');
          input.focus();
          input[0].setSelectionRange(strLength, strLength);
        }).on('blur', "input", function(e) {
          $(this).parent('.answer').removeClass('focus');
        });   

        scope.removeItem = function () {
          getItems(scope).splice(scope.i, 1);
        };

        scope.updateItem = function() {
          getItems(scope)[scope.i] = 1;
        };

        function getItems(scope, type) {
          var type = (scope.name.indexOf('answer') > -1) ? 'answer' : 'rating';
          return((type === 'answer') ? scope.q.answers : scope.q.rating.ratings);
        };
        return
      },

    }
  });   
})();