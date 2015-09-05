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

  app.directive('toolTip', function() {
    return function(scope, element, attrs) {
      var title = attrs.toolTip.split(':')[0];
      var placement = attrs.toolTip.split(':')[1];
      element.tooltip({
        title: title,
        placement: placement,
        container: '.main-content',
        html: true,
        template: '<div class="tooltip-custom" role="tooltip"><div class="tc-arrow"></div><div class="tooltip-inner"></div></div>'
      });
      scope.$on('$destroy', function(){
        element.tooltip('hide');
      });
    };
  });     

  app.directive('ckEditor', function() {
    return {
      restrict: 'E',
      templateUrl: 'CKEditor',
      scope: {
        height: '='
      },
      require: '?ngModel',
      link: function(scope, element, attr, ngModel) {
        var ck = CKEDITOR.replace(element.find('textarea')[0], {
          toolbar: [{ name: 'basic', items: ['Bold', 'Italic', 'Underline'] }],
          skin: 'BootstrapCK4,/CKSkins/bootstrapck/',
          resize_enabled: false,
          height: (scope.height || 200),
          removePlugins : 'elementspath'  
        });

        ngModel.$render = function (value) {
          ck.setData(ngModel.$modelValue);     
        };

        ck.on('pasteState', function () {
          scope.$apply(function () {
            ngModel.$setViewValue(ck.getData());
          });
        });
      }
    }
  });

  app.directive('datePicker', function() {
    return {
      restrict: 'E',
      templateUrl: 'DatePicker',
      scope: {
        minDate: '='
      },
      require: '?ngModel',
      link: function(scope, element, attr, ngModel) {
        
        var dp = element.find('input').datepicker({
          prevText: '',
          nextText: '',
          constrainInput: true,
          minDate: 0,
          maxDate: '1y',
          defaultDate: 0,
          dateFormat: 'mm/dd/yy',
          onSelect: function(date, obj) {
            scope.$apply(function() {
              ngModel.$setViewValue(date);
            }, 1000)
          }
        });

        ngModel.$render = function (value) {
          dp.datepicker('setDate', ngModel.$modelValue) 
        };

        scope.$watch('minDate', function(n, o) {
          if (n) {
            var nextDate = new Date(n);
            nextDate.setDate(nextDate.getDate() + 1);
            dp.datepicker('option', 'minDate', nextDate);
          }
        })

        element.find('i').click(function(e) {
          dp.datepicker('show');
        });
      }
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
        var currentItem; 
        $timeout((function() {
          menu.css({
            'min-width': menu.width() + 40
          });
        }), 1500);

        scope.isSelected = function(item) {
          item = angular.isObject(item) ? item.value : item;
          return scope.model === item;
        };


        scope.select = function(item) {
          if (angular.isObject(item)) {
            scope.model = item.value;
            scope.currentItem = item.name;
          } else {
            scope.model = item;
            scope.currentItem = item;
          }
  
          element.find('.select').toggleClass('active');
        };

        scope.itemName = function(item) {
          return angular.isObject(item) ? item.name : item;
        };

        scope.itemValue = function(item) {
          return angular.isObject(item) ? item.value : item;
        };

        scope.$watch('model', function(n, o) {
          if (n) {
            scope.items.forEach(function(e, i) {
              if (e.value === n) {
                scope.currentItem = e.name;
              };
            });
          }
        })
      

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