;(function() {
  var sc = angular.module('dfrSurveysControllers', []);

  sc.controller('SurveyDashController', function($scope){
  });

  sc.controller('NewSurveyController', function($scope, Survey){
    $scope.objectives = surveyObjectives;
    this.selected = function() {
      if (angular.isUndefined($scope.survey.objective)) {
        return false
      } 
      $scope.title = "Give your survey a name and descriptions."
      return true
    };

    this.redoObjective = function() {
      $scope.survey.objective = undefined;
    };

    this.hasSchedule = function() {
      return $scope.survey.schedule === 'Schedule'
    };

    this.createSurvey = function() {;
      if ($scope.surveyForm.$invalid) {return}
      $scope.survey.$save(function(result) {
        if (result.data === 'Not Logged In') {
          window.location.replace(window.location.origin + "/login");
        } else {
          $scope.survey = result;
          window.location.replace(window.location.origin + 
            "/campaign/surveys?act=edit&id=" + result.id + 
            "&name=" + result.name);
        }
      });
    };

  });

  sc.controller('SurveyResultsController', function($scope){
  });

  sc.controller('SurveyEditController', function($scope, $compile, $timeout, Survey){
    this.objectives = surveyObjectives;
    
    this.hasSchedule = function() {
      if ($scope.survey) {
        return $scope.survey.schedule === 'Schedule'
      }
      return false
    };

    this.editSurvey = function(event) {
      if ($scope.editMode) {
        if ($scope.surveyForm.$valid && $scope.surveyForm.$dirty) {
          updateSurvey(event)
        } else {
          $scope.editMode = false;
          $scope.editState = ' Edit';  
        }
      } else {
        $scope.editMode = false
        $scope.editMode = true;
        $scope.editState = ' Apply';
      }
    };

    function updateSurvey(event) {
      var element = jQuery(event.target);
      element.append($compile("<loader></loader>")($scope));
      var dirtySurvey = angular.copy($scope.survey);
      delete dirtySurvey.pages
      dirtySurvey.$update(function(r) {
        $timeout(function() {
          element.find('loader').remove()
          $scope.surveyForm.$dirty = false;
          $scope.editMode = false;
          $scope.editState = ' Edit';
        }, 1500);
      });
    }
  });

  sc.controller('SurveyListController', function($scope, $filter, Survey){
    $scope.$watch(function(scope) { return scope.massAction },
      function(n, o) {
        $scope.slistCtrl.massUpdate(n);
      }
    );

    this.surveySchedule = function(s) {
      var startDate = $filter('date')(s.start_date, 'MMM dd, yyyy');
      if (s.schedule === 'Continuosly') {
        return startDate + " -  Ongoing"
      }
      return startDate + " - " + $filter('date')(s.end_date, 'MMM dd, yyyy');
    };

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

  sc.controller('SurveyBuilderController', function($scope, $compile, $timeout, Question, QPosition) {
    this.togglePC = false;
    this.clonedSurvey;
    this.toggleQuestion = function(state, id, q) {
      if (this.togglePC) {return}
      if (state === 'Close') {
        $scope.question = $scope.newQuestion();
      } else {
        if (q) {
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
  
    this.toggleSort = function(state) {
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
      $timeout(function() {
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
      }, 1500);
    };

    this.updateQuestion = function(event) {
      var that = this;
      var element = jQuery(event.target);
      var button = element.html();
      element.html($compile("<loader></loader>")($scope));
      $timeout(function() {
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
      }, 1500);
    };
  });

  sc.controller('SurveyPageController', function($scope, SurveyPage) {
    this.newPage = new SurveyPage();
    this.rpanelState;

    this.isCurrentPage = function(page) {
      return page === $scope.currentActivePage;
    }

    this.selectPage = function(page) {
      $scope.currentActivePage = page;
    }

    this.toggleRemove = function() {
      if ($scope.sbCtrl.togglePC) {return}
      if (this.rpanelState) {
        return this.rpanelState = false;
      }
      this.rpanelState = true;
    };

    this.addPage = function(event) { 
      if ($scope.sbCtrl.togglePC) {return}
      jQuery(event.target).tooltip('destroy');
      this.newPage.$save({survey_id: $scope.sid}, function(p, r) {
        if (angular.isUndefined($scope.currentActivePage)) {
          $scope.currentActivePage = p;
        }
        $scope.pages.push(p);
      });
      this.newPage = new SurveyPage();
    };

    this.removePage = function() {
      if ($scope.sbCtrl.togglePC) {return}
      var page = $scope.currentActivePage;
      var i = $scope.pages.indexOf(page);
      SurveyPage.remove({id: page.id}, function(r){
        if (r.success ) {
          $scope.pages.splice(i, 1);
          $scope.currentActivePage = $scope.pages[0];
        }
      });
    };

    this.notPage = function(page) {
      return page != $scope.currentActivePage;
    };
  });

  sc.controller('SurveyQuestionController', function($scope, $sce, Question) {
    $scope.trustedQ = $sce.trustAsHtml($scope.q.question);
    this.removeQ = function(id, i, event) {
      if ($scope.sbCtrl.togglePC) {return}
      Question.remove({id: id}, function(r) {
        if (r.success) {
          jQuery(event.target).parent().tooltip('destroy');
          $scope.page.questions.splice(i, 1);
        }
      });
    };

    this.editQ = function(event) {
      $scope.sbCtrl.toggleQuestion('Open', null, $scope.q);
    };
    
    this.dupQ = function(event) {
      if ($scope.sbCtrl.togglePC) {return}
      delete $scope.q.id
      Question.save({survey_id: 1}, $scope.q, function(q) {
        $scope.page.questions.push(q)
      });
    };

    this.isMultiChoice = function(type) {
      return ['MC', 'YN'].indexOf(type) > -1
    };    

    this.isShort = function(type) {
      return type === 'SA';
    };

    this.isLong = function(type) {
      return type === 'LA';
    };

    this.isDropdown = function(type) {
      return type === 'DD';
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
        this.changed = $scope.sbCtrl.updatePosition();
      }
    };

    this.cancel = function() {
      $scope.sbCtrl.resetSurvey();
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
        case 'AGE':
          $scope.q.answers = ['12 - 17', '18 - 24', 
                              '25 - 34', '35 - 44',
                              '45 - 54', '55 - 64',
                              '65 - 74', '75+']
          break;
        case 'CONTACT':
          $scope.q.answers = ['Name', 'Email'];
          break;
        default:
          $scope.q.answers = [];
      }
    };

    this.showRating = function() {
      return $scope.q.type === 'MRS';
    };

    this.showNewAnswer = function() {
      return ['MC', 'DD', 'MRS', 'CONTACT'].indexOf($scope.q.type) > -1;
    };

    this.showMultiAnswer = function() {
      var type = $scope.q.type;
      return type === 'MC';
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

  var surveyObjectives = [
    { id: 'ob1', name: 'Discover your custom audiance avatar', value: 'Avatar Discovery'}, 
    { id: 'ob2', name: 'Determine market size and competition', value: 'Market Analyze' }, 
    { id: 'ob3', name: 'Discover new product or services', value: 'Product Discovery' }, 
    { id: 'ob4', name: 'Analyze and track customer insights', value: 'Customer Analyze' }, 
    { id: 'ob5', name: 'Evaluate customer satisfaction', value: 'Customer Satisfaction' },
    { id: 'ob6', name: 'Evaluate your brand awareness', value: 'Brand Awareness' }, 
    { id: 'ob7', name: 'Evaluate your sales force effectiveness', value: 'Sales Effectiveness' }, 
    { id: 'ob8', name: 'Evaluate your advertisement effectiveness', value: 'Advertisement Effectiveness' }, 
    { id: 'ob9', name: 'Evaluate employee satisfaction', value: 'Employee Satisfaction' }, 
    { id: 'ob10', name: 'Gauge your marketing efforts', value: 'Marketing Efforts' },
    { id: 'ob11', name: 'Other', value: 'Other'}
  ];
})();

