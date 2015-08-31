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
            $timeout((function() {
              scope.survey = survey;
              scope.loaded = true;
            }), 1500);
          });
        } else {
          Survey.query(function(surveys) {
            $timeout((function() {
              scope.surveys = surveys;
              scope.loaded = true;
            }), 1500);
          });
        }
    
      },
      controller: 'SurveyDashController',
      controllerAs: "sdashCtrl"
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

  sd.directive('surveyEdit', function(Survey, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'SurveyEdit',
      scope: {
        survey: '='
      },
      link: function(scope, element) {
        console.log(scope)
      }
    }
  });
  
  sd.directive('survey', function(Survey, Question, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'Survey',
      scope: {
        sid: '=',
        loaded: '='
      },
      link: function(scope, element) {
        scope.question = new Question({ answers: [], rating: { ratings: [] } });
        scope.qPanel = 'Close';
        scope.updateMode = false;
  
        Survey.get({id: scope.sid }).$promise.then(function(survey) {
          $timeout((function() {
            scope.survey = survey;
            scope.loaded = true;
          }), 1500);
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
      controller: 'SurveyController',
      controllerAs: "surveyCtrl"
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

        var QuestionEditor = CKEDITOR.replace( 'QuestionEditor', {
          toolbar: [{ name: 'basic', items: ['Bold', 'Italic'] }],
          skin: 'BootstrapCK4,/CKSkins/bootstrapck/',
          resize_enabled: false,
          height: 100,
          removePlugins : 'elementspath'  
        });

        QuestionEditor.on('change', function( evt ) {
          scope.q.question = evt.editor.getData();
        });

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
        pages: '=',
        cq: '=',
        sid: '=',
        surveyCtrl: '='
      },
      link: function(scope, element) { 
        scope.$watch('pages', function(n, o) {
          if (n != undefined && n.length === 0) {
    
          }
        });
      },
      controller: 'SurveyPageController',
      controllerAs: 'pageCtrl'
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