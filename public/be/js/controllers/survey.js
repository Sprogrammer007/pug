;(function() {

  "user strict"

  var sc = angular.module('dfrSurveysControllers', []);

  sc.controller('SurveyDashController', function($scope){
  });

  sc.controller('NewSurveyController', function($scope, Survey){
    $scope.objectives = surveyObjectives;
    this.selected = function() {
      if (angular.isUndefined($scope.survey.objective)) {
        return false
      } 
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

  sc.controller('SurveyResultsController', function($scope, $sce, ChartDefaults) {
    this.safeQuestion = function(q) {
      return $sce.trustAsHtml(q);
    }

    this.isCurrentQ = function(q) {
      return q === $scope.currentActiveQ;
    };

    this.isCurrentSubQ = function(subq) {
      return subq === $scope.currentActiveSubQ;
    };

    this.selectQ = function(q) {
      if (this.isMRS(q.type)) {
        $scope.currentActiveSubQ = q.rating.subqs[0];
      }
      $scope.currentActiveQ = q;
    };

    this.isChart = function(type) {

      return $scope.chartData.type === type;
    };    

    this.changeChartType = function(type) {
      return $scope.chartData.type = type;
    };

    this.getChartData = function(q) {
      $scope.chartData.data.rows = q.data;
      $scope.chartData.options.colors = ChartDefaults.colors(q.data.length);
      return $scope.chartData
    };    

    this.getColor = function(i) {
      if ($scope.chartData.type === 'BarChart') {
        return ChartDefaults.color(0);
      }
      return ChartDefaults.color(i);
    };

    this.selectSubQ = function(subq) {
      $scope.currentActiveSubQ = subq;
    };

    this.hasResponse = function(q) {
      return q.responses != undefined;
    };

    this.isMRS = function(type) {
      return type === 'MRS'
    };

    this.isMC = function(type) {
      return ['MC', 'DD', 'YN'].indexOf(type) > -1;
    }
  });

  sc.controller('SurveyEditController', function($scope, $compile, $timeout, Survey){
    this.objectives = surveyObjectives;
    
    this.hasSchedule = function() {
      if ($scope.survey) {
        return $scope.survey.schedule === 'Schedule'
      }
      return false
    };

    this.isPublished = function(status) {
      return status === 'Published';
    };

    this.editSurvey = function(event) {
      if ($scope.editMode) {
        if ($scope.surveyForm.$valid && $scope.surveyForm.$dirty) {
          updateSurvey(event)
        } else {
          $scope.editMode = false; 
        }
      } else {
        $scope.editMode = true;
      }
    };

    this.status = function(status) {
      return (this.isPublished(status)) ? "Unpublished" : "Published"
    }

    this.publishClass = function(status) {
      var btn = (this.isPublished(status)) ? "btn-warn" : "btn-success";
      var disable = ($scope.editMode) ? 'disable' : '';
      return btn + ' ' + disable
    };

    this.toggleStatus = function(status, showcode) {
      var newStatus = this.status(status);
      Survey.update({id: $scope.survey.id, status: newStatus}, function(r) {
        $scope.survey.status = newStatus;
        if (showcode && newStatus === 'Published') {
          $scope.noty = false;
          openPublishModal()
        } 
      });
    };

    this.openEmbed = function() {
      $scope.noty = true;
      openPublishModal()
    }

    function openPublishModal() {
      var pModal = $('.main-content').find('.publish-wrapper');
      if (pModal.length > 0) {
        if (pModal.hasClass('open')) { return };
        pModal.addClass('open');
      } else {
        $('.main-content').append($compile("<publish-modal id='pModal' noty='noty' survey='survey'></publish-modal>")($scope));
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

    this.updateSelection = function($event, s) {
      var action = (event.target.checked ? 'add' : 'remove');
      updateSelected(action, s);
    };

    this.selectAll = function($event) {
      var action = (event.target.checked ? 'add' : 'remove');
      $scope.surveys.forEach(function(v, k, l) {
        updateSelected(action, v);
      });
    };

    this.getSelectedClass = function(s) {
      return $scope.isSelected(s.id) ? 'selected' : '';
    };

    this.currentSurvey = function() {
      if ($scope.selected){
        var l = $scope.selected.length;
        if (l === 0 || l > 1) { return }
        return $scope.selected[0]
      }
    }

    this.isSelected = function(s) {
      return $scope.selected.indexOf(s) >= 0;
    };

    this.isSelectedAll = function() {
      if (!$scope.surveys) { return }
      return $scope.selected.length === $scope.surveys.length;
    };

    this.isSelectedSingle = function() {
      if (!$scope.surveys) { return }
      return $scope.selected.length === 1;
    };

    function updateSelected(action, s) {
      var index = $scope.selected.indexOf(s);
      if (action === 'add' && index  === -1) {
        $scope.selected.push(s);
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

  sc.controller('SurveyPageController', function($scope, $compile, Question, SurveyPage) {
    this.newPage = new SurveyPage();
    this.rpanelState;
    this.currentItem;

    this.openMenu = function(e, q, p) {
      this.currentItem = {q: q, p: p};
      $scope.$broadcast('open.context.menu', e)
    };

    this.removeQ = function() {
      if ($scope.sbCtrl.togglePC) {return}
      var that = this;
      var i = this.currentItem.p.questions.indexOf(this.currentItem.q);
      if ($scope.sbCtrl.togglePC) {return}
      Question.remove({id: this.currentItem.q.id, 
        survey_id: $scope.survey.id}, function(r) {
        if (r.success && i > -1) {
          that.currentItem.p.questions.splice(i, 1);
        }
      });
    };

    this.editQ = function() {
      if ($scope.sbCtrl.togglePC) {return}
      $scope.sbCtrl.toggleQuestion('Open', null, this.currentItem.q);
    };
    
    this.dupQ = function(event) {
      if ($scope.sbCtrl.togglePC) {return}
      var that = this;
      delete this.currentItem.q.id
      Question.save({survey_id: this.currentItem.q.survey_id}, this.currentItem.q, function(q) {
        that.currentItem.p.questions.push(q)
      });
    };


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
      this.newPage.$save({survey_id: $scope.survey.id}, function(p, r) {
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
      SurveyPage.remove({id: page.id, survey_id: $scope.survey.id}, function(r){
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

  sc.controller('SurveyQuestionController', function($scope, $compile, $sce, Question) {
    $scope.trustedQ = $sce.trustAsHtml($scope.q.question);

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

    this.updateAnswer = function(type) {
      switch ($scope.q.type) {
        case 'YN':
          $scope.q.answers = [{id:'A01', value: 'Yes'}, {id:'A02', value: 'No'}];
          $scope.q.rating = undefined;
          break;
        case 'AGE':
          $scope.q.answers = [
            {id:'A01', value: '12 - 17'},
            {id:'A02', value: '18 - 24'}, 
            {id:'A03', value: '25 - 34'}, 
            {id:'A04', value: '35 - 44'}, 
            {id:'A05', value: '45 - 54'}, 
            {id:'A06', value: '55 - 64'}, 
            {id:'A07', value: '65 - 74'}, 
            {id:'A08', value: '75+'}
          ]
          $scope.q.rating = undefined;
          break;
        case 'MRS':
          $scope.q.answers = [];
          $scope.q.rating = {};
          $scope.q.rating.ratings = [];
          $scope.q.rating.subqs = [];
          break;
        case 'CONTACT':
          $scope.q.answers = [{id:'A01', value: 'Name'}, {id:'A02', value: 'Email'}];
          $scope.q.rating = undefined;
          break;
        default:
          $scope.q.answers = [];
          $scope.q.rating = undefined;
      }
    };

    this.showRating = function() {
      return $scope.q.type === 'MRS';
    };

    this.showAnswer = function() {
      return ['MC', 'DD', 'CONTACT'].indexOf($scope.q.type) > -1;
    };

    this.showMultiAnswer = function() {
      return $scope.q.type === 'MC';
    };

    this.showRemoveable = function() {
      return $scope.q.type !== 'YN';
    };

    this.showRatingType = function(type) {
      if ($scope.q.rating) {
        return $scope.q.rating.type === type;
      }
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

      getItem($scope, type).push(prepareAnswer(type, input.val()))
      input.val('');
    };

    function prepareAnswer(type, val) {
      var t = type.charAt(0).toUpperCase();
      var key = t + Math.floor((Math.random() * 1000) + 1);
      var item = {};
      item['value'] = val;
      item['id'] = key;
      return item;
    }

    function getItem(scope, type) {
      if (type === 'answer') {
        return scope.q.answers
      }

      if (type === 'rating') {
        return scope.q.rating.ratings
      }

      if (type === 'question') {
        return scope.q.rating.subqs
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

