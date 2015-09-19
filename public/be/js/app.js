;(function(document, window) {
  "use strict";

  function prepareRequires() {
    var requires;
    var defaults = ['ngResource', 'dfrMainDirectives', 'ui.sortable', 'googlechart'];
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
        fromDate: '=',
        inline: '=',
        toDate: '=',
        options: '='
      },
      require: '?ngModel',
      link: function(scope, element, attr, ngModel) {
        var e = scope.inline ? element.find('.datepicker') : element.find('input')
        var doption = {
          prevText: '',
          nextText: '',
          constrainInput: true,
          dateFormat: 'mm/dd/yy',
          onSelect: function(date, obj) {
            scope.$apply(function() {
              ngModel.$setViewValue(date);
            }, 1000);
          },
          beforeShowDay: function(d, obj) {
            var fromDate = new Date(scope.fromDate ? scope.fromDate : ngModel.$modelValue)
            var toDate = new Date(scope.toDate ? scope.toDate : ngModel.$modelValue);
            if (scope.options['minDate'] === 0 && d >= fromDate && d <= toDate) {
              return [true, 'ui-range', '']
            }

            if (scope.options['maxDate'] === 0 && d >= toDate && d <= fromDate) {

              return [true, 'ui-range', '']
            }         
            return [true, '', ''];
          }
        };

        var dp = e.datepicker($.extend(doption, scope.options));

        ngModel.$render = function (value) {
          dp.datepicker('option', 'minDate', scope.options.minDate);
          dp.datepicker('option', 'maxDate', scope.options.maxDate);
          dp.datepicker('setDate', ngModel.$modelValue); 
        };

        scope.$watch('fromDate', function(n, o) {
          if (!n) { return }
          if (scope.options['minDate'] === 0) {
            var nextDate = new Date(n);
            nextDate.setDate(nextDate.getDate() + 1);
            dp.datepicker('option', 'minDate', nextDate);
            if (nextDate > new Date(ngModel.$modelValue)) {
              ngModel.$setViewValue(nextDate);
            }
          }
          if (scope.options['maxDate'] === 0) {
            var prevDate = new Date(n);
            prevDate.setDate(prevDate.getDate() - 1);
            dp.datepicker('option', 'maxDate', prevDate);
            if (prevDate < new Date(ngModel.$modelValue)) {
              ngModel.$setViewValue(prevDate);
            }
          }
        });

        scope.$watch('toDate', function(n, o) {
          if (n != o) {
            dp.datepicker('refresh');
          }
        })

        element.find('i').click(function(e) {
          dp.datepicker('show');
        });
      }
    };
  });   

  app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
      var fn = $parse(attrs.ngRightClick);
      element.bind('contextmenu', function(event) {
        scope.$apply(function() {
          event.preventDefault();
          fn(scope, {$event:event});
        });
      });
    };
  });

  app.directive('contextMenu', function() {
    return {
      restrict: 'E',
      templateUrl: 'ContextMenu',
      transclude: true,
      scope: {
        'disabled': '='
      },
      link: function(scope, element) {
        scope.open = false;
        scope.disabled = false;
        var position;
        var menu = element.find('.context-menu'); 
  
        scope.$on('open.context.menu', function(e, event) {
          position = getPosition(event);
          if (scope.disabled) {return}
          scope.opened = true;
        });

        scope.setPosition = function() {
          if (!position) {return}
          var left;
          var top;
          var menuW = menu.offsetWidth + 4;
          var menuH = menu.offsetHeight + 4;
          var windowW = window.innerWidth;
          var windowH = window.innerHeight;

          if ( (windowW - position.x) < menuW ) {
            left = windowW - menuW + "px";
          } else {
            left = position.x + "px";
          }

          if ( (windowH - position.y) < menuH ) {
            top = windowH - menuH + "px";
          } else {
            top = position.y + "px";
          }
          return {top: top, left: left}
        };
       
        function getPosition(e) {
          var posx = 0;
          var posy = 0;

          if (!e) var e = window.event;
          
          if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
          } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
          }

          return {
            x: posx,
            y: posy
          }
        };

        function handleKeyUpEvent(event) {
          if (scope.opened && event.keyCode === 27) {
            scope.$apply(function() {
              scope.opened = false;
            });
          }
        }

        function handleClickEvent(event) {
        
          if (scope.opened && event.button !== 2 ) {
            if (event.target === menu.get()[0]) {return}
            scope.$apply(function() {
              scope.opened = false;
            });
          }
        }

        $(document).bind('keyup', handleKeyUpEvent);
        $(document).bind('click', handleClickEvent);

        scope.$on('$destroy', function() {
          $(document).unbind('keyup', handleKeyUpEvent);
          $(document).unbind('click', handleClickEvent);
        });
      }
    }
  });

  app.directive('customSelect', function($timeout) {
    return {
      restrict: 'E',
      templateUrl: 'CustomSelect',
      scope: {
        model: '=',
        items: '=',
        selected: '=',
        change: '&',
      },
      link: function (scope, element, attrs) {
        scope.opened = false;
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

        scope.toggle = function() {
          if (scope.opened) {
            return scope.opened = false;
          }
          scope.opened = true;
        };

        scope.select = function(item, event) {
          scope.model = scope.itemValue(item)
          scope.currentItem = scope.itemName(item)

          if (scope.change) {
            scope.change({m: scope.currentItem, e: event})
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
              if (scope.itemValue(e) === n) {
                scope.currentItem = scope.itemName(e);
              };
            });
          } else {
            scope.currentItem = scope.selected;
          }
        });

        $(document).on('click', function(e) {
          if (!$(e.target).closest('.select').length) {
            if (scope.opened) {
              scope.$apply(function() {
                scope.opened = false;
              });
              return 
            }
          }
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


})(document, window);