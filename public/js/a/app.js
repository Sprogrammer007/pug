;(function() {
  var app = angular.module('dfr', 
    [
      'dfrSurveyDirectives', 
      'dfrSurveyControllers'
    ]);

  app.filter('range', function() {
    return function(input, start, total) {
      total = parseInt(total) + 1;
      start = parseInt(start);
      for (var i=start; i<total; i++)
        input.push(i);
      return input;
    };
  });

  app.directive('loader', function(){
    return {
      restrict: 'E',
      templateUrl: 'loader',
      scope: {
        name: "@"
      }
    };
  });

  app.directive('customSelect', function() {
    return {
      restrict: 'E',
      templateUrl: 'customSelect',
      scope: {
        placeholder: '=',
        disable: '=',
        name: '@',
        items: '='
      },
      link: function (scope, element, attrs) {
        $(element).on('click', '.select-ui', function() {
          $(this).parent().toggleClass('active');
        }); 

        $(element).on('click', '.menu-item', function() {
          var newSelect = $(this).data('value');
          scope.$apply(function() {
            scope.placeholder = newSelect;
          });
         
          var previousSelected = $(element).find('.selected');
          if (previousSelected.length > 0) {previousSelected.removeClass('selected'); }
          $(this).addClass('selected');
          $(this).parents('.select').toggleClass('active');
        });
      }
    }
  });

  app.directive("include", function ($http, $templateCache, $compile) {
    return {
      restrict: 'A',
      link: function (scope, element, attributes) {
        var templateUrl = scope.$eval(attributes.include);
        $http.get(templateUrl, {cache: $templateCache}).success(
          function (tplContent) {
              element.replaceWith($compile(tplContent)(scope));
          }
        );
      }
    };
  });

})();