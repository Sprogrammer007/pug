;(function() {
  var sc = angular.module('dfrSurveyControllers', []);

  sc.controller('SurveyController', function($scope, $compile, $timeout, Survey, Question) {
    $scope.loaded = false;
    $scope.question = new Question({ answers: [], rating: { ratings: [] } });
    $scope.answers = new Question({ answers: [], rating: { ratings: [] } });
    $scope.qPanel = 'Close';
    
    Survey.get({id: $scope.sid }).$promise.then(function(survey) {
      console.log(survey)
      $timeout((function() {

        $scope.survey = survey;

        $scope.loaded = true;
      }), 1500);
    });

    $scope.openQuestion = function() {
      return $scope.qPanel === 'Open';
    };

    $scope.toggleQuestion = function(state, id) {
      if (state === 'Close') {
        CKupdate();
        $scope.question = new Question({answers: [], rating: { ratings: [] } });
      } else {
        $scope.question.survey_page_id = id;
      }
      $scope.qPanel = state;
    };

    $scope.saveQuestion = function(event, close) {
      var element = jQuery(event.target);
      var button = element.html();
      element.html($compile("<loader></loader>")($scope));
      $timeout((function() {
        $scope.question.$save({survey_id: $scope.sid}, function(q, r) {
          var pageID = parseInt(q.survey_page_id);
          $scope.survey.pages.forEach(function(e, i, a) {
            if (e.id === pageID) {
              e.questions.push(q);
            };
          });
          element.html(button);
          if (close) {
            $scope.toggleQuestion('Close', pageID);
          } else {
            CKupdate();
            $scope.question = new Question({answers: [], rating: { ratings: [] } });
          }

        });
      }), 1500);
    };
  });

  sc.controller('SurveyPageController', function($scope, SurveyPage) {

    this.currentPage = new SurveyPage({id: $scope.sid});
    this.addPage = function(event) {

      var element = jQuery(event.target);
      var input = element.prev('.pti');
      var text = (element.text() === 'Add Page') ? "Create Page" : "Add Page"

      if (input.val() != '' && text === "Add Page") {

        this.currentPage.$save({survey_id: $scope.sid}, function(p, r) {
          $scope.pages.push(p);
          element.html(text);
          input.removeClass('active');
          input.val() = '';
        });

        return
      }; 

      element.text(text);
      input.toggleClass('active').focus();
    }
  });

  sc.controller('QuestionFormController', function($scope) {
    this.answerTypes = answerTypes;

    this.updateAnswer = function() {
      switch ($scope.q.type) {
        case 'YN':
          $scope.q.answers = ['Yes', 'No'];
          break;
        default:
          $scope.q.answers = [];
      }
    };

    this.showRating = function() {
      return $scope.q.type === 'MRS';
    };

    this.showNewAnswer = function() {
      return ['MC', 'DD', 'MRS'].indexOf($scope.q.type) > -1;
    };

    this.showMultiAnswer = function() {
      var type = $scope.q.type;
      return type === 'MC' || type === 'DD';
    };

    this.showRemoveable = function() {
      var type = $scope.q.type;
      return type !== 'YN';
    };

    this.showRatingType = function(type) {
      return $scope.q.rating.type === type;
    };

    this.addItem = function($event, type) {
      var that = jQuery($event.target);
      var input = that.is('input') ? that : that.siblings('input');
      if (input.val() === '') {
        return false;
      }
      if ($event.type === 'keyup' && $event.keyCode !== 13) {
        return false;
      }
      getItems($scope, type).push(input.val());
      input.val('');
    };


    function getItems (scope, type) {
      if (type === 'answer') {
        return scope.q.answers;
      } else {
        return scope.q.rating.ratings;
      }
    };
  });

  function CKupdate(){
    for ( instance in CKEDITOR.instances ){
      CKEDITOR.instances[instance].updateElement();
    }
    CKEDITOR.instances[instance].setData('');
  }


  answerTypes = [
    { id: 'at-mc', name: 'Multiple Choice', value: 'MC'}, 
    { id: 'at-sa', name: 'Short Answer', value: 'SA' }, 
    { id: 'at-la', name: 'Long Answer', value: 'LA' }, 
    { id: 'at-na', name: 'Numerical Answer', value: 'NA' }, 
    { id: 'at-dd', name: 'Dropdown', value: 'DD' },
    { id: 'at-yn', name: 'Yes/No', value: 'YN' }, 
    { id: 'at-mrs', name: 'Matrix (Rating Scale)', value: 'MRS' }, 
    { id: 'at-age', name: 'Age', value: 'AGE' }, 
    { id: 'at-contact', name: 'Name/Email', value: 'CONTACT' }, 
    { id: 'at-geo', name: 'Geographic', value: 'GEO' }
  ];
})();

