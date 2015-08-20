;(function() {
  var app = angular.module('dfr', 
    [
      'ngResource', 
      'dfrSurveyDirectives', 
      'dfrSurveyControllers'
    ]).config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
  }]);

  app.filter('range', function() {
    return function(input, start, total) {
      total = parseInt(total) + 1;
      start = parseInt(start);
      for (var i=start; i<total; i++)
        input.push(i);
      return input;
    };
  });

  app.filter('getById', function() {
    return function(input, id) {
      var i=0, len=input.length;
      for (; i<len; i++) {
        if (+input[i].id == +id) {
          return input[i];
        }
      }
      return null;
    }
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

  app.directive('title', function() {
    return function(scope, element) {
      element.tooltip({container: 'body'});
      scope.$on('$destroy', function(){
        element.tooltip('destroy');
      });
    };
  }); 

  app.directive('customSelect', function() {
    return {
      restrict: 'E',
      templateUrl: 'customSelect',
      scope: {
        model: '=',
        items: '='
      },
      link: function (scope, element, attrs) {
        scope.model = scope.items[0];
        scope.isSelected = function(item) {
          return scope.model === item;
        }

        scope.select = function(item) {
          scope.model = item;
          element.find('.select').toggleClass('active');
        }

        jQuery('body').click(function(e) {
          var c = jQuery(e.target)
          if (c.hasClass('select') || c.parents().hasClass('select')) { return };
          if (jQuery('.select').hasClass('active')) {
            jQuery('.select').removeClass('active');
          }
        });

        element.on('click', '.select-ui', function() {
          jQuery(this).parent().toggleClass('active');
        }); 

      }
    }
  });

  app.directive("include", function ($http, $templateCache, $compile) {
    return function(scope, element, attributes) {
      var templateUrl = scope.$eval(attributes.include);
      $http.get(templateUrl, {cache: $templateCache}).success(
        function (tplContent) {
            element.replaceWith($compile(tplContent)(scope));
        }
      );
    };
  });

})();