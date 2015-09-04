'use strict';
;(function() {
  var md = angular.module('dfrMainDirectives', [])
  
  md.directive('mainApp', function(Params) {
    return {
      restrict: "E",
      transclude: true,
      templateUrl: 'MainApp',
      scope: {
      },
      link: function(scope, element) {
        element.find('#mainBody').TrackpadScrollEmulator();
        scope.loaded = false;
        scope.currentID = Params.id;
      }
    }
  });  

  md.directive('mainMenu', function(Params) {
    return {
      restrict: "E",
      templateUrl: 'MainMenu',
      scope: {
        username: '@'
      },
      link: function(scope, element) {
        scope.campaignName = Params.name;
        scope.hasCampaign = function() {
          if (scope) {
            return true
          }
          return false
        };
      }
    }
  });  

  md.directive('lineChart', function() {
    return {
      restrict: "E",
      templateUrl: 'LineChart',
      scope: {
        data: '=',
        labels: '=',
        width: '@',
        height: '@'
      },
      link: function(scope, element) {
        scope.labels = ["January", "February", "March", "April", "May", "June", "July"]
        var ctx = element.find('canvas').get(0).getContext("2d");
        var data = {
          labels: ["January", "February", "March", "April", "May", "June", "July"],
          datasets: [
            {
                label: "My First dataset",
                fillColor: "rgba(220,220,220,0)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: [65, 59, 80, 81, 56, 55, 40]
            },
            {
                label: "My Second dataset",
                fillColor: "rgba(151,187,205,0.2)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)",
                data: [28, 48, 40, 19, 86, 27, 90]
            }
          ]
        };
        var chart = new Chart(ctx).Line(data)
      }
    }
  });
})();