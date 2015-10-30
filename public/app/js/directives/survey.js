;(function() {
  "use strict"
  var sd = angular.module('dfrSurveysDirectives', [])
  
  sd.directive('surveyDash', function(Survey,  Question, $timeout) {
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
        scope.question = new Question();
        scope.qPanel = 'Close';
        scope.updateMode = false;
  
        scope.openQuestion = function() {
          return scope.qPanel === 'Open';
        };
        
        if (scope.sid) {
          Survey.get({id: scope.sid }).$promise.then(function(survey) {
            loadSurvey('survey', survey);
          });
        } else {
          Survey.query(function(surveys) {
            loadSurvey('surveys', surveys);
          });
        }

        function loadSurvey (type, obj) {
          $timeout(function() {
            scope[type] = obj;
            scope.loaded = true;
          }, 1500);
        }
      },
      controller: 'SurveyDashController',
      controllerAs: "sdCtrl"
    }
  });    

  sd.directive('newSurvey', function(Survey) {
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
        scope.massActions = ['All Surveys', 'Delete']

        scope.$watchCollection('surveys', function(n, o) {
          if (n) {
            scope.totals = {responses: 0, amount: 0, pages: 0, questions: 0};
            angular.forEach(n, function(v, k) {
              scope.totals.responses += parseInt(v.response);  
              scope.totals.amount +=  parseInt(v.amount_spent);  
              scope.totals.pages +=  parseInt(v.page_count);
              scope.totals.questions +=  parseInt(v.question_count);  
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

  sd.directive('accountDetails', function(User, $timeout) {
    return {
      restrict: "E",
      templateUrl: "AccountDetails",
      scope: {
        currentUser: '=',
        loaded: '='
      },
      link: function(scope, element) {
        scope.modalStatus = false;
        scope.currentTab = 'Invite';
        scope.currentModal = 'Purchase Responses';
        scope.packages = [
          {name: "500 Responses", responses: 500,   price: 15},
          {name: "1k Responses",  responses: 1000,  price: 25},
          {name: "5k Responses",  responses: 5000,  price: 80, popular: true},
          {name: "10k Responses", responses: 10000, price: 120},
          {name: "25k Responses", responses: 25000, price: 240},
          {name: "50k Responses", responses: 50000, price: 400}
        ]
        scope.currentPackage = scope.packages[2];
        scope.$watchCollection('currentUser', function(n, o) {
          if (n.services) {
            scope.service = n.services.Survey;
          }
        });

        scope.switchPackage = function(pac) {
          scope.currentPackage = pac;
        }

        scope.isCurrentPackage = function(pac) {
          return pac === scope.currentPackage;
        };
        scope.isCurrentTab = function(tab) {
          return scope.currentTab === tab;
        };

        scope.isModal = function(modal) {
          return modal === scope.currentModal;
        };

        scope.applyCoupon = function(coupon, e) {
          if (!coupon) { return }
          $(e.target).prop('disabled', true);
          User.coupon({service: 'Survey', coupon: coupon}, function(r) {
            $timeout(function() {
              if (r.success) {
                scope.service = r.service
                scope.closeModal();
              } else {
                scope.couponError = r.message
              }
              $(e.target).prop('disabled', false)
            }, 1500);  
          });
        }

        scope.changeTab = function(tab) {
          scope.currentTab = tab;
        };

        scope.openInvite = function() {
          $('.refer-emails').addClass('open')
        };

        scope.openModal = function(modal) {
          scope.currentModal = modal;
          scope.modalStatus = (scope.modalStatus) ? false : true;
        };

        scope.closeModal = function() {
          scope.modalStatus = false;
        };

        scope.successPayment = function(res, cc) {
          User.pay({service: 'Survey', 
            stripe: {token: res.id, zip: cc.address_zip},
            pkg: scope.currentPackage}, function(service) {
            if (service) {
              scope.service = service;
            }
          });
        };
      }
    }
  })
  
  sd.directive('surveyChart', function(Response, DateFilter, ChartDefaults) {
    return {
      restrict: "E",
      templateUrl: 'SurveyChart',
      scope: {
        currentUser: '=',
        chartType: '=',
        loaded: '='
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
            colors:  ['#ff5a5f'],
            hAxis: {
              format: 'MMM d',
              gridlines: {count: 7, color: 'transparent'}

            }
          }
        });
        scope.currentFilters = DateFilter.get();
        scope.$watchCollection('currentFilters', function(n, o) {
          Response.counts($.extend({id: 1}, n), function(r) {
            if (r.data.length < 7) {
              scope.chartData.options.hAxis.gridlines.count = r.data.length;
            } else {
              scope.chartData.options.hAxis.gridlines.count = 7;
            }
            scope.chartData.data.rows = r.data   
            scope.legends.total = r.total
          });
        })
      }
    }
  });  

  sd.directive('surveyResults', function(Response, ChartDefaults) {
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
        scope.filterDPOptions =  {
          minDate: 0,
          maxDate: '1y'
        };
        scope.surveyErrors = undefined;   
        scope.$watch('survey', function(n, o) {
          if (n) {
            scope.surveyDescip = $sce.trustAsHtml(n.description);
            scope.tyMessage = ($sce.trustAsHtml(n.thank_msg || 'None'));
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
  
  sd.directive('questionForm', function() {
    return {
      restrict: "E",
      templateUrl: 'questionForm',
      scope: {
        q: '=',
        sid: '=',
        um: '=',
        sdCtrl: '='
      },
      link: function(scope, element) {
        scope.currentPQ = undefined;

        // Clear Preset
        scope.$watch('q', function(n, o) {
          scope.currentPQ = undefined;
        
        });

        scope.$watch('q.choices.type', function(n, o) {
          if (!n) {return}
          if (n === "Numeric") {
            scope.q.choices.ratings = [{id:'A1', value: 1}, {id:'A2', value: 2}, {id:'A3', value: 3}]
          } else {
            scope.q.choices.ratings = [];
          }
        });
        scope.isInValid = function() {
          if (scope.qbForm.$invalid) {return true};
          
          var type = scope.q.type;
          var choices = scope.q.choices;
          if (['MC', 'DD', 'SC'].indexOf(type) > -1) {
            var emptyA = choices.isEmpty();
            return emptyA
          };
          if (['MRS', 'SRS'].indexOf(type) > -1 && choices.type === 'Custom') {
            var emptyR = choices.ratings.isEmpty();
            var emptyQ;
            if (type === 'MRS') {
               emptyQ = choices.subqs.isEmpty(); 
            }
            return (emptyQ || emptyR)
          };
          return false 
        }

        var questionBuilder = element.find('.box-body')
        questionBuilder.TrackpadScrollEmulator();
        resizeUI(window.innerWidth, window.innerHeight);
 
   
        function resizeUI(w, h) {
          questionBuilder.css({
            'height': (h - 110)
          });
          questionBuilder.TrackpadScrollEmulator('recalculate');
        }
        
        $(window).resize(function() {
          resizeUI(window.innerWidth, window.innerHeight);
        });

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
        sdCtrl: '='
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
        errors: '='
      },
      link: function(scope, element) {
        console.log(scope)
        scope.close = function() {
          element.find('.publish-wrapper').removeClass('open')
        };
      }
    }
  });   
})();