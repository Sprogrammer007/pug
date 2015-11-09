;(function() {
  'use strict';

  var md = angular.module('pugMainDirectives', [])
  
  md.directive('mainApp', function(Params, User, $http) {
    return {
      restrict: "E",
      transclude: true,
      templateUrl: 'MainApp',
      scope: {
        currentUser: '=',
        inviteToken: '='
      },
      link: function(scope, element) {
        $http.defaults.headers.common['session-token']= $('meta[property="session-token"]').attr('content');
        scope.loaded = false;
        scope.currentID = Params.id;
        User.services().$promise.then(function(services) {
          scope.currentUser.services = services;
        });

        if (scope.currentUser) {
          var socket = io('http://localhost:3000');
          socket.emit('login', scope.currentUser);
        };

        scope.alert = {};
        scope.emails = [];
        scope.emailsCount = [0];
        
        scope.$watchCollection('emails', function(n, o) {
          if (n && o && n.length > o.length) {
            scope.emailsCount.push(0);
          }     
        });

        if (scope.currentUser.status === 'Active') {
          setAlert('notify', 'To publish your surveys, please verify your email. <a class="resend-email">Resend confirmation</a>')
        };

        
        if (scope.inviteToken) {
          User.coupon({service: 'Survey', coupon: scope.inviteToken}, function(r) {
            if (r.success) {
              setAlert('notify', 'Invite code has been applied. 250 responses has been added to your account.')
            } else {
              setAlert('alert', "Invalid invite code")
            }
          });
        };

        scope.closeAlert = function(e) {
          scope.alert = {};
        };

        scope.closeReferBox = function() {
          var service = scope.currentUser.services['Survey'];
          if (service.first_time) {
            User.updateService({id: service.id}, {first_time: false }, function(r) {
              console.log(r)
            });
          }
          $('.refer-box').removeClass('open');
        };

        $('.welcome-box .typecast').each(typeAnimate);

        function typeAnimate(i, e) {

          if (i === 0) { 
            $(this).css({
              display: 'block',
              width: '100%',
              animation: 'type 2s steps(' + $(this).text().length + ', end)'
            });
          }

          $(this).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
            $(e.target).next('.typecast').css({
              display: 'block',
              width: '100%',
              animation: 'type 2s steps(' + $(this).text().length + ', end)'
            });
          });
        }

        element.on('click', '.resend-email', function(e) {
          var that = this;
          User.resendConfirm(function(r) {
            if (r.success) {
              $(that).replaceWith('Done..')
            }
          });
        });

        var mainBody, mainMenu;
        element.ready(function() {
          mainMenu = element.find('.main-menu');
          mainBody = element.find('#mainBody');

          mainBody.TrackpadScrollEmulator();
          resizeUI(window.innerWidth, window.innerHeight);
        });
   
        function resizeUI(w, h) {
          mainBody.css({
            'width': w,
            'height': h
          });  

          mainMenu.css({
            'clip': 'rect(0px ' + w + 'px 109px 0px)'
          });

          element.find('.main-content').css({
            'margin-top': + mainMenu.height() + 10,
          });

          mainBody.TrackpadScrollEmulator('recalculate');
        }


        $(window).resize(function() {
          resizeUI(window.innerWidth, window.innerHeight);
        });

        function setAlert(state, msg) {
          scope.alert.status = state;
          scope.alert.message = msg;
        }
      }
    }
  });  
  

  md.directive('paymentForm', function() {
    return {
      restrict: "E",
      templateUrl: 'PaymentForm',
      transclude: true,
      scope: {
        success: '&'
      },
      link: function(scope, element) {
        element.find('.cc-num').payment('formatCardNumber');
        element.find('.cc-exp').payment('formatCardExpiry');
        element.find('.cc-cvc').payment('formatCardCVC');
        scope.cc = {}; 
        scope.ccError; 
        scope.$watchCollection('cc', function(n, o) {
          n.cardType = $.payment.cardType(n.number);
        });

        scope.submitPayment = function() {
          validateCC();
          if (scope.paymentForm.$invalid) {return}
          Stripe.card.createToken(scope.cc, function(status, response) {
            if (response.error) {
              console.log(response.error);
              scope.ccError = response.error;
            } else {
              if (scope.success) {
                scope.success()(response, scope.cc)
              }
            };
          });
        };

        function validateCC() {
          var cc = scope.cc
            , p = $.payment
            , form = scope.paymentForm
            , validNum = p.validateCardNumber(cc.number)
            , validExp = p.validateCardExpiry(cc.exp_month, cc.exp_year)
            , validCvc = p.validateCardCVC(cc.cvc, cc.cardType);

          form.ccNum.$setValidity('invalidNum', validNum);
          form.ccMonth.$setValidity('invalidExp', validExp);
          form.ccYear.$setValidity('invalidExp', validExp);
          form.ccCVC.$setValidity('invalidCVC', validCvc);
        }
      } 
    }  
  });

  md.directive('ngScrollable', function($timeout) {
    return {
      restrict: "A",
      link: function(scope, element) {
        element.TrackpadScrollEmulator();   
      }
    }
  });  
  
  md.directive('mainMenu', function(Params, DateFilter) {
    return {
      restrict: "E",
      templateUrl: 'MainMenu',
      scope: {
        currentUser: '='
      },
      link: function(scope, element) {
        scope.campaignName = Params.name;
        scope.shopStatus = false;

        scope.packages = [
          {name: "500 Responses", responses: 500,   price: 15},
          {name: "1k Responses",  responses: 1000,  price: 25},
          {name: "5k Responses",  responses: 5000,  price: 80, popular: true},
          {name: "10k Responses", responses: 10000, price: 120},
          {name: "25k Responses", responses: 25000, price: 240},
          {name: "50k Responses", responses: 50000, price: 400}
        ];

        scope.currentPackage = scope.packages[2];
        
        scope.switchPackage = function(pac) {
          scope.currentPackage = pac;
        };


        scope.isCurrentPackage = function(pac) {
          return pac === scope.currentPackage;
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

        scope.openShop = function() {
          scope.shopStatus = (scope.shopStatus) ? false : true;
        };

        scope.closeShop = function() {
          scope.shopStatus = false;
        };       

        scope.hasCampaign = function() {
          if (scope.campaignName) {
            return true
          }
          return false
        };
      }
    }
  });  

  md.directive('toolTip', function() {
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

  md.directive('ckEditor', function() {
    return {
      restrict: 'E',
      templateUrl: 'CKEditor',
      scope: {
        height: '='
      },
      require: '?ngModel',
      link: function(scope, element, attr, ngModel) {
        var ck = CKEDITOR.replace(element.find('textarea')[0], {
          toolbar: [
            { name: 'basic', items: ['Bold', 'Italic', 'NumberedList', 'BulletedList', 'Image'] },
            { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'Undo', 'Redo']}
          ],
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

  md.directive('datePicker', function() {
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

  md.directive('ngRightClick', function($parse) {
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

  md.directive('contextMenu', function() {
    return {
      restrict: 'E',
      templateUrl: 'ContextMenu',
      transclude: true,
      scope: {
        'disabled': '='
      },
      link: function(scope, element) {
        scope.open = false;
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

  md.directive('customSelect', function($timeout) {
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

})();