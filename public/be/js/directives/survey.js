;(function() {
  "use strict"
  var sd = angular.module('dfrSurveysDirectives', [])
  
  sd.directive('surveyDash', function(Survey, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'SurveyDash',
      transclude: true,
      scope: {
        loaded: '=',
        sid: '=',
        mainCtrl: '=',
        currentUser: '='
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
        scope.filterDPOptions =  {
          minDate: 0,
          maxDate: '1y'
        }    
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

  sd.directive('surveyList', function() {
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
        scope.massActions = ['All Surveys', 'Archive']

        scope.$watch('surveys', function(n, o) {
          if (n) {
            scope.totals = {responses: 0, amount: 0, pages: 0, questions: 0};
            angular.forEach(n, function(v, k) {
              scope.totals.responses += v.response  
              scope.totals.amount +=  v.amount_spent  
              scope.totals.pages +=  v.page_count
              scope.totals.questions +=  v.question_count  
            });
          }
        });

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
  
  sd.directive('surveyChart', function(Response, DateFilter, ChartDefaults) {
    return {
      restrict: "E",
      templateUrl: 'SurveyChart',
      scope: {
        currentUser: '=',
        chartType: '='
      },
      link: function(scope, element) {
        scope.legends = {};
        scope.chartData = ChartDefaults.merge({
          type: 'LineChart',
          data: {
            cols: [
              {id: 'X', type: 'datetime'},
              {id: 'Responses', label: 'Responses', type: 'number'}
            ]
          },
          options: {
            colors:  ['#F88B4D'],
            hAxis: {
              format: 'MMM d',
              gridlines: {count: 10, color: 'transparent'}

            }
          }
        });
        scope.currentFilters = DateFilter.get();
        scope.$watchCollection('currentFilters', function(n, o) {
          Response.counts($.extend({id: 1}, n), function(r) {
            scope.chartData.data.rows = r.data   
            scope.legends.total = r.total
          });
        })
      },
      controller: 'SurveyChartController',
      controllerAs: 'scCtrl'
    }
  });  

  sd.directive('surveyResults', function(Response, $timeout, ChartDefaults) {
    return {
      restrict: "E",
      templateUrl: 'SurveyResults',
      scope: {
        survey: '=',
        loaded: '='
      },
      link: function(scope, element) {
        scope.currentActiveSubQ = undefined;
        scope.chartData = ChartDefaults.merge({
          type: 'PieChart',
          data: {
            cols: [
              {id: 'answer', type: 'string'},
              {id: 'count', type: 'number'}
            ]
          },
          options: {
            height: 200,
            chartArea: { width: '80%' , height: '90%'},
            pieSliceTextStyle: {fontName: 'Oswald', fontSize: 14}       
          }
        });
        scope.$watch('survey', function(n, o) {
          if (angular.isUndefined(n)) { return }
          Response.all({id: n.id}, function(questions) {
            scope.questions = questions
            scope.currentActiveQ = scope.questions[0];
          });
        });
      },
      controller: 'SurveyResultsController',
      controllerAs: 'srCtrl'
    }
  });

  sd.directive('surveyEdit', function($sce, $filter) {
    return {
      restrict: "E",
      templateUrl: 'surveys/editbox',
      scope: {
        survey: '=',
        loaded: '=',
        page: '@'
      },
      link: function(scope, element) {
        scope.noty = false;
        scope.$watch('survey', function(n, o) {
          if (n) {
            scope.surveyDescip = $sce.trustAsHtml(n.description);
            scope.tyMessage = ($sce.trustAsHtml(n.thank_you || 'None'));
          }
        });

        scope.isPage = function(page) {
          return page === scope.page
        };
        scope.editMode = false;
       
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
        scope.noty = false;

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
          var defaults = {answers: []};
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
        $('.question-builder .box-body').TrackpadScrollEmulator();

        scope.isInValid = function() {
          var emptyA = scope.q.answers.isEmpty();
          if (scope.qbForm.$invalid) {return true};
          if (['MC', 'DD'].indexOf(scope.q.type) > -1) {
            return emptyA
          };
          if (scope.q.type === 'MRS' && scope.q.rating.type === 'Custom') {
            var emptyR = scope.q.rating.ratings.isEmpty();
            var emptyQ = scope.q.rating.subqs.isEmpty();
            return (emptyQ || emptyR)
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
      link: function(scope, element) {
      },
      controller: 'SurveyQuestionController',
      controllerAs: 'sqCtrl'
    }
  });   

  sd.directive('arBox', function() {
    return {
      restrict: "E",
      templateUrl: 'surveyARBox',
      scope: {
        item: '=',
        items: '=',
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
          var i = scope.items.indexOf(scope.item);
          scope.items.splice(i, 1);
        };    
      },

    }
  });

  sd.directive('publishModal', function() {
    return {
      restrict: 'E',
      templateUrl: 'surveys/publishmodal',
      scope: {
        survey: '=',
        noty: '='
      },
      link: function(scope, element) {
        scope.close = function() {
          element.find('.publish-wrapper').removeClass('open')
        };
      }
    }
  });   
})();