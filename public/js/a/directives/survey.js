;(function() {
  
  var sd = angular.module('dfrSurveyDirectives', [])
  
  sd.directive('survey', function(Survey) {
    return {
      restrict: "E",
      templateUrl: 'Survey',
      scope: {},
      link: function(scope, element) {
        console.log(scope)
        $('.body-content').TrackpadScrollEmulator();

        var QuestionEditor = CKEDITOR.replace( 'QuestionEditor', {
          toolbar: [{ name: 'basic', items: ['Bold', 'Italic'] }],
          skin: 'BootstrapCK4,/CKSkins/bootstrapck/',
          resize_enabled: false,
          height: 100,
          removePlugins : 'elementspath'  
        });

        QuestionEditor.on('change', function( evt ) {
          $("textarea[name='question[question]']").val(evt.editor.getData());
        });

      },
      controller: 'SurveyController'
    }
  });

  sd.directive('surveyPage', function() {
    return {
      restrict: "E",
      templateUrl: 'surveyPage'
    }
  });   


  sd.directive('arBox', function() {
    return {
      restrict: "E",
      templateUrl: 'surveyARBox',
      scope: {
        name: '@',
        value: '=',
        removeable: '=',
        removeitem: '&'
      },
      link: function(scope, element) {
        $(element).on('click', ".edit-answer, input", function(e) {
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
      }
    }
  });   


  sd.directive('answerTypes', function() {
    return {
      restrict: "E",
      templateUrl: 'answerTypes',
      link: function(scope, element, attrs) {

      },
      controllerAs: 'answerTypeCtrl'
    }
  });

})();