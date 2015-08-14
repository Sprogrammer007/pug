;(function() {

  var sc = angular.module('dfrSurveyControllers', []);

  sc.controller('SurveyController', function($scope, Survey) {
    $scope.survey = {};
    $scope.loaded = false;
    $scope.qPanel = 'Closed';

    Survey.get(function(err, survey) {
      $scope.survey = survey;
      $scope.loaded = true;

    });

    $scope.openQuestion = function() {
      return $scope.qPanel === 'Open'
    };
    $scope.toggleQuestion = function(state) {
      $scope.qPanel = state;
    };
  });

  sc.controller('QuestionBuilderController', function(){
   
    this.answers = [];
    this.ratings = [];
    this.answerType = '';
    this.ratingType = '';
    this.allowMultiAnswer = false;
    this.allowNewAnswer = false;
    this.hasRating = false;
    this.Removeable = true;
    this.answerTypes = answerTypes;
    this.updateAnswer = function() {
      switch(this.answerType) {
        case 'MC':
        case 'DD':
          updateAnswerDisplay.call(this, true, true, false)
          break;
        case 'MRS':
          updateAnswerDisplay.call(this, true, false, true)
          break;
        case 'YN':
          this.Removeable = false;
          updateAnswerDisplay.call(this, false, false, false, ["Yes", "No"])
          break;
      }
      return 
    };

    this.addAnswer = function($event) {
      addAR.call(this, $event, 'answers');
    };

    this.addRating = function($event) {
      addAR.call(this, $event, 'ratings');
    };

    this.removeItem = function(index, type) {
      this[type].splice(index, 1);
    };

    this.isCustom = function() {
      return this.ratingType === 'Custom'
    };    
    this.isNumeric = function() {
      return this.ratingType === 'Numeric'
    };

    function addAR(event, type) {
      var that = $(event.target);
      var input =  that.is('input') ? that : that.siblings('input');
      if (input.val() === '')  {return false };
      if (event.type === 'keyup' && event.keyCode != 13) { return false };
      this[type].push(input.val());
      input.val('');
    }

    function updateAnswerDisplay(answer, multi, rating, answers) {
      var answers = answers || [];
      this.allowNewAnswer = answer;
      this.allowMultiAnswer = multi;
      this.hasRating = rating;
      this.answers = answers;
      return
    };
  });

  var answerTypes = [
    { id: 'at-mc', name: 'Multiple Choice', value: 'MC'},
    { id: 'at-sa', name: 'Short Answer', value: 'SA'},
    { id: 'at-la', name: 'Long Answer', value: 'LA'},
    { id: 'at-na', name: 'Numerical Answer', value: 'NA'},
    { id: 'at-dd', name: 'Dropdown', value: 'DD'},
    { id: 'at-yn', name: 'Yes/No', value: 'YN'},
    { id: 'at-mrs', name: 'Matrix (Rating Scale)', value: 'MRS'},
    { id: 'at-age', name: 'Age', value: 'AGE'},
    { id: 'at-contact', name: 'Name/Email', value: 'CONTACT'},
    { id: 'at-geo', name: 'Geographic', value: 'GEO'},
  ];
})();