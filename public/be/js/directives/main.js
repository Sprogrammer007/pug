
;(function() {
  'use strict';

  var md = angular.module('dfrMainDirectives', [])
  
  md.directive('mainApp', function(Params, CurrentUser, $timeout) {
    return {
      restrict: "E",
      transclude: true,
      templateUrl: 'MainApp',
      scope: {
      },
      link: function(scope, element) {
        $timeout(function(){
          scope.currentUser = CurrentUser.get();
        },500);
     
        element.find('#mainBody').TrackpadScrollEmulator();
        scope.loaded = false;
        scope.currentID = Params.id;
      }
    }
  });  
  
  md.directive('mainMenu', function(Params, DateFilter, CurrentUser) {
    return {
      restrict: "E",
      templateUrl: 'MainMenu',
      scope: {
        currentUser: '='
      },
      link: function(scope, element) {
        DateFilter.set(getDate(0), getDate(7));
        scope.filter = filterObj();
        scope.campaignName = Params.name;
        scope.copyOfFilter;
        scope.filterDPOptions =  {
          changeYear: true,
          changeMonth: true,
          minDate: '-4y',
          maxDate: 0
        };
        scope.hasCampaign = function() {
          if (scope.campaignName) {
            return true
          }
          return false
        };

        scope.selectFilter = function(f) {
          switch(f.value) {
            case 'This Month':
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
              break;
            default:
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
          var fb = element.find('.filter-box');
          var menu = element.find('.filter-dropdown');
          menu.css({
            top: fb.position().top + fb.height() + 10,
            left: fb.position().left + fb.width() - menu.width() - 5,
          });
          if (scope.filter.show) {
            scope.filter = scope.copyOfFilter;
            return scope.filter.show = false;
          }
          scope.copyOfFilter = angular.copy(scope.filter);
          scope.filter.show = true;
        };

        scope.closeFilter = function(e, ok) {
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
          if (!$(e.target).closest('.filter-dropdown').length
            && !$(e.target).closest('.filter-box').length) {
            if (scope.filter.show) {
              scope.$apply(function() {
                scope.filter.show = false;
                scope.filter = scope.copyOfFilter;
              });
              return 
            }
          }
        });
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
        {value: 0, name: "Today"},
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
})();