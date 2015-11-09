;(function() {
  "use strict"
  var sd = angular.module('pugSurveysDirectives', [])
  
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
        scope.currentStep = 1;
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
        scope.referStatus = false;
        scope.currentTab = 'Invite';

        scope.rewardLevels = [
          {count: 5, reward: '500'},
          {count: 10, reward: '1,000'},
          {count: 25, reward: '2,500'},
          {count: 50, reward: '5,000'}
        ];
        
        scope.$watchCollection('currentUser', function(n, o) {
          if (n.services) {
            scope.service = n.services.Survey;
          }
        });

        scope.isRewardLevel = function(count) {
          if (!scope.service) { return }
          return count < scope.service.options.accepted_invites;
        };

        scope.currentLevel = function() {
          if (!scope.service) { return }
          var invites = scope.service.options.accepted_invites;
          if (invites >= 5 && invites < 10) {
            return 'level-one';
          }          

          if (invites >= 10 && invites < 25) {
            return 'level-two';
          }          

          if (invites >= 25 && invites < 50) {
            return 'level-three';
          }          

          if (invites > 50) {
            return 'level-four';
          }

        }

        scope.hasFriends = function() {
          if (!scope.service) { return }
          return scope.service.options.accepted_invites > 0;
        };

        scope.isCurrentTab = function(tab) {
          return scope.currentTab === tab;
        };

        scope.changeTab = function(tab) {
          scope.currentTab = tab;
        };
 

        scope.openRefer = function() {
          scope.referStatus = (scope.referStatus) ? false : true;
        };

        scope.closeRefer = function() {
          scope.referStatus = false;
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
        };

        element.on('click', '.ref_share_link', function(e) {
          e.preventDefault();
          var refUrl = "https://www.pugsquad.com/register?ref=" + scope.service.ref_code;
          window.open($(this).attr('href') + refUrl, "_blank", "top=0, left=500,width=600, height=400")
        });
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

        //Filter
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
        });

        DateFilter.set(getDate(0), getDate(7));
        scope.filter = filterObj();
        scope.copyOfFilter;
        scope.filterDPOptions =  {
          changeYear: true,
          changeMonth: true,
          minDate: '-4y',
          maxDate: 0
        };
 

        scope.selectFilter = function(f) {
          switch(f.value) {
            case 'This Month':
              scope.filter.startDate = moment().format('MM/DD/YYYY');
              scope.filter.endDate = moment().startOf('month').format('MM/DD/YYYY');
              DateFilter.set(scope.filter.startDate, scope.filter.endDate)
              break;            
            case 'Last Month':
              var lastMonth = moment().subtract(1, 'month');
              scope.filter.startDate = lastMonth.endOf('month').format('MM/DD/YYYY');
              scope.filter.endDate = lastMonth.startOf('month').format('MM/DD/YYYY');
              DateFilter.set(scope.filter.startDate, scope.filter.endDate)
              break;           
            case 'Lifetime':
              scope.filter.startDate = moment().format('MM/DD/YYYY');
              scope.filter.endDate =  moment(scope.currentUser.register_date).format('MM/DD/YYYY');
              DateFilter.set(scope.filter.startDate, scope.filter.endDate)
    
              break;
            default:
              scope.filter.startDate = moment().format('MM/DD/YYYY');
              scope.filter.endDate = getDate(f.value);
              DateFilter.set(scope.filter.startDate, scope.filter.endDate)
          }
          scope.filter.currentFilter = f.name;
          scope.filter.show = false;
        }

        scope.createDate = function(date) {
          return new Date(date);
        };

        scope.selectMY = function(v, e, type, input) {
          var value = (type === 'month') ? scope.filter.monthNames.indexOf(v) : v
          input = input || $(e.target).parents('.filter-datepicker');
          if (optionExists(input.find('.ui-datepicker-' + type), value)){
            input.find('.ui-datepicker-' + type).val(value).trigger('change');
          }
        }

        scope.openFilter = function(e) {

          if (scope.filter.show) {
            scope.filter = scope.copyOfFilter;
            return scope.filter.show = false;
          }
          scope.copyOfFilter = angular.copy(scope.filter);
          scope.filter.show = true;
        };

        scope.closeFilter = function(ok) {

          if (scope.filter.show && !ok) {
            scope.filter = scope.copyOfFilter;
            return scope.filter.show = false;
          }

          if (ok) {
            scope.filter.currentFilter = moment(new Date(scope.filter.endDate)).format('MMM D, YYYY') 
            + " - " + moment(new Date(scope.filter.startDate)).format('MMM D, YYYY')
            DateFilter.set(scope.filter.startDate, scope.filter.endDate)
          }

          scope.filter.show = false;
        };

        scope.$watchCollection('filter', function(n, o) {
          if (n) {
            var fromDay = moment().month(n.cfMonth).year(n.cfYear);
            var toDay = moment().month(n.ctMonth).year(n.ctYear);
            if (fromDay.isBefore(toDay, 'month')) {
              var filterTo = $('.filter-to');
              n.ctMonth = fromDay.format('MMMM');
              n.ctYear = fromDay.year();
              scope.selectMY(n.ctMonth, null, 'month', filterTo);
              scope.selectMY(n.ctYear, null, 'year', filterTo);
            };
          }
        });

        $(document).on('click', function(e) {

          if ($(e.target).parents('.filter-box').length < 1) {
            if (scope.filter.show) {
              scope.$apply(function() {
                scope.filter.show = false;
                scope.filter = scope.copyOfFilter;
              });
              return 
            }
          }
        });


        function optionExists(select, val) {
          return select.find("option[value='" + val + "']").length !== 0;
        };

        function getDate(num) {
          return moment().subtract(num, 'd').format('MM/DD/YYYY')
        };

        function filterObj() {

          function getYears() {
            var y = [];
            var d = moment();
            for (var i = 0; i < 4; i++) {
              y.push(d.subtract((i === 0) ? i : 1, 'y').year())
            };
            return y
          };
          
          return {
            show: false,
            currentFilter: "Last 7 Days",
            startDate: getDate(0),
            endDate: getDate(7),
            cfMonth: moment().format("MMMM"),
            cfYear: moment().year(),      
            ctMonth: moment().format("MMMM"),
            ctYear: moment().year(),      
            years: getYears(),
            monthNames: ["January", "February", "March", "April", 
            "May", "June", "July", "August",
            "September", "October", "November", "December"],
            filterNames: [
              {value: 1, name: "Yesterday"}, 
              {value: 7, name: "Last 7 Days"}, 
              {value: 14, name: "Last 14 Days"}, 
              {value: 30, name: "Last 30 Days"}, 
              {value: "This Month", name: "This Month"}, 
              {value: "Last Month", name: "Last Month"}, 
              {value: "Lifetime", name: "Lifetime"} 
            ]
          }
        };
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
        survey: '='
      },
      link: function(scope, element) {
        scope.close = function() {
          element.find('.publish-wrapper').removeClass('open')
        };
      }
    }
  });   
})();