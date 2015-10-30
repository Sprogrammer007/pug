;(function(document, window) {
  "use strict";

  // Remove the ugly Facebook appended hash
  if (window.location.hash) {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };

      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    
  }

  function prepareRequires() {
    var requires;
    var defaults = ['ngResource', 'ngSanitize', 'dfrMainDirectives', 'ui.sortable', 'googlechart'];
    var location = window.location.pathname.split('/')[2];
    var name = location.charAt(0).toUpperCase() + location.slice(1);
    requires = defaults.concat(['dfr' + name + 'Directives', 'dfr' + name + 'Controllers'])

   return requires
  };

  var app = angular.module('dfr', prepareRequires())
  .config(['$compileProvider', function ($compileProvider) {
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

  app.filter('isZero', function() {
    return function(input) {
      return (parseInt(input) === 0 ? "—" : input);
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
      },
      link: function(scope, element) {
      }
    };
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


  Array.prototype.replaceWith = function(item, condition) {
    this.forEach(function(e, i, a) {
      if (condition(e)) {
        a[i] = item;
      }
    });
  };
  
  Array.prototype.isEmpty = function() {
    return (this.length === 0)  
  };


})(document, window);