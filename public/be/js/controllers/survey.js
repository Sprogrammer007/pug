;(function() {
  var sc = angular.module('dfrSurveysControllers', []);

  sc.controller('SurveyDashController', function($scope){
  });

  sc.controller('NewSurveyController', function($scope, Survey){
    this.survey = new Survey();
    this.selected = function() {
      return !angular.isUndefined(this.survey.objective)
    };

    this.createSurvey = function() {;
      if ($scope.surveyForm.$invalid) {return}
      this.survey.$save(function(result) {
        if (result.data === 'Not Logged In') {
          window.location.replace(window.location.origin + "/login");
        } else {
          this.survey = result;
          window.location.replace(window.location.origin + "/campaign/survey/" + result.id + "/b");
        }
      });
    }
  });

  sc.controller('SurveyResultsController', function($scope){
  });

  sc.controller('SurveyListController', function($scope, Survey){
    $scope.$watch(function(scope) { return scope.massAction },
      function(n, o) {
        $scope.slistCtrl.massUpdate(n);
      }
    );

    this.massUpdate = function(action) {
      if (!this.isSelectedAll()) {
        if (action != 'All Surveys') {$scope.massAction = 'All Surveys'}
      }
    };

    this.isPublished = function(status) {
      return status === 'Published'
    };

    this.toggleStatus = function(i) {
      var s = ($scope.surveys[i].status === 'Published') ? 'Unpublished' : 'Published';      
      Survey.update({id: $scope.surveys[i].id}, {status: s}, function(r) {
        $scope.surveys[i].status = s;
      });
    };

    this.updateSelection = function($event, id) {
      var action = (event.target.checked ? 'add' : 'remove');
      updateSelected(action, id);
    };

    this.selectAll = function($event) {
      var action = (event.target.checked ? 'add' : 'remove');
      $scope.surveys.forEach(function(e, i, a) {
        updateSelected(action, e.id);
      });
    };

    this.getSelectedClass = function(s) {
      return $scope.isSelected(s.id) ? 'selected' : '';
    };

    this.isSelected = function(id) {
      return $scope.selected.indexOf(id) >= 0;
    };

    //something extra I couldn't resist adding :)
    this.isSelectedAll = function() {
      if (!$scope.surveys) { return }
      return $scope.selected.length === $scope.surveys.length;
    };

    function updateSelected(action, id) {
      var index = $scope.selected.indexOf(id);
      if (action === 'add' && index  === -1) {
        $scope.selected.push(id);
      }
      if (action === 'remove' && index !== -1) {
        $scope.selected.splice(index, 1);
      }
    };
  });

  sc.controller('SurveyChartController', function($scope) {
  });

  sc.controller('SurveyController', function($scope, $compile, $timeout, Question, QPosition) {
    this.togglePC = false;
    this.clonedSurvey;
    this.toggleQuestion = function(state, id, q) {
      if ($scope.togglePC) {return}
      if (state === 'Close') {
        CKupdate();
        $scope.question = $scope.newQuestion();
      } else {
        if (q) {
          CKupdate(q.question);
          $scope.question = angular.copy(q);
          $scope.updateMode = true;
        } else {
          $scope.updateMode = false;
          $scope.question.survey_page_id = id;
        }
      }
      $scope.qPanel = state;
    };

    this.resetSurvey = function() {
      $scope.survey = this.clonedSurvey;
      this.toggleSort(false);
    };

    this.updatePosition = function() {
      var data = {};
      $scope.survey.pages.forEach(function(e, i){
        if(e.questions.isEmpty()) { return };
        data[e.id] = [];
        e.questions.forEach(function(a,i) {
          data[e.id].push(a.id);
        });
      });
      if(QPosition.update(data)) {
        this.toggleSort(false); 
        return false;
      };
      return true;
    }
  
    this.toggleSort  = function(state) {
      if (state) {
        this.clonedSurvey = angular.copy($scope.survey)
      }
      this.togglePC = state;
    };

    this.saveQuestion = function(event, close) {
      var element = jQuery(event.target);
      var button = element.html();
      var that = this;

      element.html($compile("<loader></loader>")($scope));
      $timeout((function() {
        $scope.question.$save({survey_id: $scope.sid}, function(q, r) {
          var pageID = parseInt(q.survey_page_id);
          $scope.survey.pages.pushWhen(q, function(e) { return e.id === pageID });
          element.html(button);
          if (close) {
            that.toggleQuestion('Close', pageID);
          } else {
            CKupdate();
            $scope.question = $scope.newQuestion(pageID);
          }
        });
      }), 1500);
    };

    this.updateQuestion = function(event) {
      var that = this;
      var element = jQuery(event.target);
      var button = element.html();
      element.html($compile("<loader></loader>")($scope));
      $timeout((function() {
        Question.update({id: $scope.question.id}, $scope.question, function(r) {
          var pageID = parseInt($scope.question.survey_page_id);
          $scope.survey.pages.forEach(function(e, i, a) {
            if (e.id === pageID) {
              e.questions.replaceWith($scope.question, function(e) { return e.id === $scope.question.id });
            };
          });
          element.html(button);
          that.toggleQuestion('Close');
        });
      }), 1500);
    };
  });

  sc.controller('SurveyPageController', function($scope, $sce, $timeout, SurveyPage) {
    this.currentPage = new SurveyPage();
    this.removetoggle;

    this.toggleRemove = function(id) {
      if ($scope.surveyCtrl.togglePC) {return}
      if (this.removetoggle === id) {
        return this.removetoggle = -1;
      }
      this.removetoggle = id;
    };

    this.openRemove = function(id) {
      if ($scope.surveyCtrl.togglePC) {
        this.removetoggle = -1;
      }      
      return (this.removetoggle === id);
    }

    this.addPage = function(event) { 
      if ($scope.surveyCtrl.togglePC) {return}
      jQuery(event.target).tooltip('destroy');
      this.currentPage.$save({survey_id: $scope.sid}, function(p, r) {
        $scope.pages.push(p);
      });
      this.currentPage = new SurveyPage();
    };

    this.removePage = function(id, i, event) {
      if ($scope.surveyCtrl.togglePC) {return}
      var element = $(event.target);
      this.removetoggle = -1;
      SurveyPage.remove({id: id}, function(r){
        if (r.success ) {
          element.parents('.p-' + element.data('pid'))
          .removeClass('fadeIn').addClass('fadeOut');

          $timeout((function() {
            $scope.pages.splice(i, 1);
            $scope.$apply();
          }), 1500);
        }
      });
    };

    this.notPage = function(p1, p2) {
      return p1 != p2;
    };
  });

  sc.controller('SurveyQuestionController', function($scope, $sce, Question) {
    $scope.trustedQ = $sce.trustAsHtml($scope.q.question);
    this.removeQ = function(id, i, event) {
      if ($scope.togglePC) {return}
      Question.remove({id: id}, function(r) {
        if (r.success) {
          jQuery(event.target).parent().tooltip('destroy');
          $scope.page.questions.splice(i, 1);
        }
      });
    };

    this.editQ = function(event) {
      if ($scope.togglePC) {return}
      $scope.toggleQuestion({state: 'Open', q: $scope.q});
    };
    
    this.dupQ = function(event) {
      if ($scope.togglePC) {return}
      delete $scope.q.id
      Question.save({survey_id: 1}, $scope.q, function(q) {
        $scope.page.questions.push(q)
      });
      
    };
  });

  sc.controller('MiniMapController', function($scope) {

    this.changed = false;
    var that = this;
    this.sortableOptions = {
      connectWith: ".connectedlist",
      dropOnEmpty: true,
      update: function(e, ui) {
        that.changed = true;
        return
      }
    };

    this.update = function() {
      if (this.changed) {
        this.changed = $scope.surveyCtrl.updatePosition();
      }
    };

    this.cancel = function() {
      $scope.surveyCtrl.resetSurvey();
    };
  });

  sc.controller('QuestionFormController', function($scope) {
    this.answerTypes = answerTypes;

    this.save = function(event, close) {
      if ($scope.isInValid()) { return } 
      $scope.surveyCtrl.saveQuestion(event, close)
    };

    this.update = function(event) {
      if ($scope.isInValid()) { return } 
      $scope.surveyCtrl.updateQuestion(event, close)
    };

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

  function CKupdate(data){
    for ( instance in CKEDITOR.instances ){
      CKEDITOR.instances[instance].updateElement();
    }
    data = data || '';
    CKEDITOR.instances[instance].setData(data);
  };

  var answerTypes = [
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

