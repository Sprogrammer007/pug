;(function() {
  
  var sd = angular.module('dfrSurveyDirectives', [])

  
  sd.directive('survey', function(Survey) {
    return {
      restrict: "E",
      templateUrl: 'Survey',
      scope: {
        sid: '='
      },
      link: function(scope, element) {
        $('.body-content').TrackpadScrollEmulator();
      },
      controller: 'SurveyController'
    }
  });

  sd.directive('questionForm', function(Survey) {
    return {
      restrict: "E",
      templateUrl: 'questionForm',
      scope: {
        q: '='
      },
      link: function(scope, element) {
        var QuestionEditor = CKEDITOR.replace( 'QuestionEditor', {
          toolbar: [{ name: 'basic', items: ['Bold', 'Italic'] }],
          skin: 'BootstrapCK4,/CKSkins/bootstrapck/',
          resize_enabled: false,
          height: 100,
          removePlugins : 'elementspath'  
        });

        QuestionEditor.on('change', function( evt ) {
          scope.q.question = evt.editor.getData();
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
        pages: '=',
        sid: '=',
        toggleQuestion: '&'
      },
      controller: 'SurveyPageController',
      controllerAs: 'pageCtrl'
    }
  });   

  sd.directive('question', function() {
    return {
      restrict: "E",
      templateUrl: 'surveyQuestion',
      controller: function($scope, $sce) {
        this.trustedQ = $sce.trustAsHtml($scope.q.question);
      },
      controllerAs: 'SQCtrl'
    }
  });   


  sd.directive('arBox', function() {
    return {
      restrict: "E",
      templateUrl: 'surveyARBox',
      scope: {
        name: '@',
        value: '=',
        i: '=',
        q: '=', 
        removeable: '=',
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
          getItems(scope).splice(scope.i, 1);
        };

        scope.updateItem = function() {
          getItems(scope)[scope.i] = 1;
        };

        function getItems(scope, type) {
          var type = (scope.name.indexOf('answer') > -1) ? 'answer' : 'rating';
          return((type === 'answer') ? scope.q.answers : scope.q.rating.ratings);
        };
        return
      },

    }
  });   



})();