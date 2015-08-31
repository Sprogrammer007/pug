;(function() {
  "use strict";
  function prepareRequires() {
    var requires;
    var defaults = ['ngResource', 'dfrMainDirectives', 'ui.sortable'];
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

  app.directive('title', function() {
    return function(scope, element) {
      element.tooltip({container: element.parent()});
      scope.$on('$destroy', function(){
        element.tooltip('destroy');
      });
    };
  });   

  app.directive('customSelect', function($timeout) {
    return {
      restrict: 'E',
      templateUrl: 'CustomSelect',
      scope: {
        model: '=',
        items: '='
      },
      link: function (scope, element, attrs) {
        var menu = element.find('.select-menu');
    
        $timeout((function() {
          menu.css({
            'min-width': menu.width() + 50
          });
        }), 1500);

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

  app.service('Params', function() {
    return window.parseQuery();
  });

  Array.prototype.replaceWith = function(item, condition) {
    this.forEach(function(e, i, a) {
      if (condition(e)) {
        a[i] = item;
      }
    });
  };

  Array.prototype.pushWhen = function(item, condition) {
    this.forEach(function(e, i, a) {
      if (condition(e)) {
        a[i].questions.push(item);
      };
    });
  };  
  
  Array.prototype.isEmpty = function() {
    return (this.length === 0)  
  };


  window.parseQuery = function () {
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
          // If first entry with this name
      if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
          // If second entry with this name
      } else if (typeof query_string[pair[0]] === "string") {
        var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
        query_string[pair[0]] = arr;
          // If third or later entry with this name
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
      }
    } 
      return query_string;
  };

})();