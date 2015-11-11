;(function() {

  "user strict"

  var sc = angular.module('pugSurveysControllers', []);

  sc.controller('SurveyDashController', function($scope, $compile, $timeout, Question, QPosition) {
    this.togglePC = false;
    this.clonedSurvey;
    this.toggleQuestion = function(state, id, q) {
      if (this.togglePC || this.isPublished()) {return}
      if (state === 'Close') {
        $scope.question = new Question();
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

    this.isPublished = function() {
      if ($scope.survey) {
        return $scope.survey.status === 'Published';
      };
    };

    this.resetSurvey = function() {
      $scope.survey = this.clonedSurvey;
      this.toggleSort(false);
    };

    this.updatePosition = function() {
      if (this.isPublished()) { return }
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
      if (this.isPublished()) { return }
      if (state) {
        this.clonedSurvey = angular.copy($scope.survey)
      }
      this.togglePC = state;
    };

    this.saveQuestion = function(event, close) {
      var element = $(event.target);  
      var that = this;
      element.addClass('loading');
      $timeout(function() {
        $scope.question.$save({survey_id: $scope.survey.id}, function(q, r) {
          var pageID = parseInt(q.survey_page_id);
          element.removeClass('loading');
          $scope.survey.pages.forEach(function(e, i, a) {
            if (e.id === pageID) {
              e.questions.push($scope.question);
            };
          });
          if (close) {
            that.toggleQuestion('Close', pageID);
          } else {
            $scope.question = new Question({survey_page_id: pageID});
          }
        });
      }, 1500);
    };

    this.updateQuestion = function(event) {
      var that = this;
      var element = $(event.target);
      element.addClass('loading');
      $timeout(function() {
        Question.update({id: $scope.question.id}, $scope.question, function(r) {
          var pageID = parseInt($scope.question.survey_page_id);
          element.removeClass('loading');
          $scope.survey.pages.forEach(function(e, i, a) {
            if (e.id === pageID) {
              e.questions.replaceWith($scope.question, function(e) { return e.id === $scope.question.id });
            };
          });
          that.toggleQuestion('Close');
        });
      }, 1500);
    };
  });

  sc.controller('NewSurveyController', function($scope, Survey){
    $scope.objectives = surveyObjectives;

    this.nextStep = function() {
      if (this.isLastStep()) {return} 
      $scope.currentStep++;
    };

    this.prevStep = function() {
      if (this.isFirstStep()) {return} 
      $scope.currentStep--;
    };

    this.isStep = function(step) {
      return $scope.currentStep === step;
    };

    this.isFirstStep = function() {
      return $scope.currentStep === 1;
    };

    this.isLastStep = function() {
      return $scope.currentStep === 5;
    };

    this.progressStepStatus = function(step) {
      if ($scope.currentStep === step) {
        return "active";
      } 

      if ($scope.currentStep > step) {

        if (hasError(step)) {
          return "has-errors";
        } else {
          return "completed";
        }
      }
    }

    this.hasSchedule = function() {
      return $scope.survey.schedule === 'Schedule';
    };

    this.createSurvey = function() {;
      if ($scope.surveyForm.$invalid) { return }
      $scope.survey.$save(function(s) {
        if (s) {
          window.location.replace(window.location.origin + 
          "/campaign/surveys?act=edit&id=" + s.id + 
          "&name=" + s.name);
        }
      });
    };

    function hasError(step) {
      switch(step) {
        case 1:
          return angular.isUndefined($scope.survey.objective)
          break;        
        case 2:
          return angular.isUndefined($scope.survey.name) || angular.isUndefined($scope.survey.description) 
          break;
        case 3:
          var v = (angular.isUndefined($scope.survey.type) ||  angular.isUndefined($scope.survey.schedule))
          if ($scope.survey.schedule === 'Schedule') {
            return ( v || angular.isUndefined($scope.survey.end_date));
          } else {
            return v;
          }
          break;        
        case 4:
          return angular.isUndefined($scope.survey.thank_msg)
          break;
        default:
          return false;
      }
     
    }
  });

  sc.controller('SurveyResultsController', function($scope, 
    $timeout, $filter, $sce, ChartDefaults, TextAnalyze) {
    
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
      if (this.isType(q.type, ['MRS'])) {
        $scope.currentActiveSubQ = q.choices.subqs[0];
      }
      $scope.currentActiveQ = q;
    };

    this.isActive = function(type, list) {
      var classes = [];
      list = list || ['MRS', 'MC', 'DD', 'SRS'];
      var q = $scope.currentActiveQ;
      if ($scope.chartData.type === type) {
        classes.push('active');
      }

      if (q && !this.isType(q.type, list)) {
        classes.push('disable');
      }

      return classes;
    }

    this.changeChartType = function(type) {
      if (!this.isType($scope.currentActiveQ.type, ['MRS', 'MC', 'DD', 'SRS'])) { return }
      return $scope.chartData.type = type;
    };

    this.getChartData = function(q) {
      if (!q) {return};
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

    this.isType = function(type, list) {
      return list.indexOf(type) > -1;
    };

    this.getChoices = function(q) {
      var choices = (this.isType(q.type, ['SRS', 'MRS'])) ? q.choices.ratings : q.choices;
      return choices
    };

    this.analyzeText = function() {
      var q = $scope.currentActiveQ;
      if (this.isType(q.type, ['LA', 'SA'])) {

        q.wordFrequency = TextAnalyze.analyze(q.responses.data)

        $timeout(function() {
          q.showWordBox = true;
        }, 1000);
      }
    };

    this.textAnswers = function (q) {
      var data = q.responses.data;
      data = $filter('limitTo')(data, '100', '0');
      data = $filter('filter')(data, q.wordSearch);
      return data
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
      return (this.isPublished(status)) ? "Pause" : "Publish";
    };

    this.publishClass = function(status) {
      var btn = (this.isPublished(status)) ? "btn-warn" : "btn-success";
      var disable = ($scope.editMode) ? 'disable' : '';
      return btn + ' ' + disable
    };

    this.toggleStatus = function() {
      var s = $scope.survey
      var newStatus = (s.status === 'Published') ? 'Paused' : 'Published';      
      Survey.updateStatus({id: s.id}, {survey: s, new_status: newStatus}, function(r) {
        if (r.success) {
          s.status = newStatus;
        } else {
          $('.survey-publish-error').toggleClass('active')
        }
    
      });
    };

    this.deleteSurvey = function() {
      Survey.updateStatus({id: $scope.survey.id}, {new_status: 'Archived'}, function(r) {
        if (r.success) {
          window.location.replace(window.location.origin + "/campaign/surveys")
        } else {
          console.log(r.errors);
        }
      });
    };

    this.publish = function() {
      var s = $scope.survey
      var newStatus = (s.status === 'Published') ? 'Paused' : 'Published';      
      Survey.updateStatus({id: s.id}, {survey: s, new_status: newStatus}, function(r) {
        if (r.success) {
          s.status = newStatus;
          if (newStatus === 'Published') {
            openPublishModal()
          }
        } else {
         $scope.surveyErrors = r.message;
        }

      });
    };

    this.openEmbed = function() {
      openPublishModal()
    };

    function openPublishModal() {
      var pModal = $('.main-content').find('.publish-wrapper');
      if (pModal.length > 0) {
        if (pModal.hasClass('open')) { return };
        pModal.addClass('open');
      } else {
        $('.main-content').append($compile("<publish-modal id='pModal' survey='survey'></publish-modal>")($scope));
      }
    };

    function updateSurvey(event) {
      var element = $(event.target);
      element.addClass('loading');
      var dirtySurvey = angular.copy($scope.survey);
      delete dirtySurvey.pages
      dirtySurvey.$update(function(r) {
        $timeout(function() {
          element.removeClass('loading');
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


    this.deleteSurvey = function() {
      if ( this.isSelectedSingle()) {
        var survey = $scope.selected[0]
        Survey.updateStatus({id: survey.id}, {new_status: 'Archived'}, function(r) {
          if (r.success) {
            $scope.surveys.splice($scope.surveys.indexOf(survey), 1);
            $scope.selected = [];
          } else {
            console.log(r.errors);
          }
        });
      }

    };

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
      var s = $scope.surveys[i];
      var newStatus = (s.status === 'Published') ? 'Paused' : 'Published';      
      Survey.updateStatus({id: s.id}, {survey: s, new_status: newStatus}, function(r) {
        if (r.success) {
          s.status = newStatus;
        } else {
          $('.survey-publish-error').toggleClass('active')
        }
    
      });
    };

    this.updateSelection = function(e, s) {
      var action = (e.target.checked ? 'add' : 'remove');
      updateSelected(action, s);
    };

    this.selectAll = function(e) {
      var action = (e.target.checked ? 'add' : 'remove');
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

  sc.controller('SurveyPageController', function($scope, $compile, $filter, Question, SurveyPage) {
    this.newPage = new SurveyPage();
    this.rpanelState;
    this.currentItem;

    this.openMenu = function(e, q, p) {
      this.currentItem = {q: q, p: p};
      $scope.$broadcast('open.context.menu', e)
    };

    this.removeQ = function() {
      if ($scope.sdCtrl.togglePC || $scope.sdCtrl.isPublished()) {return}
      var that = this;
      var i = this.currentItem.p.questions.indexOf(this.currentItem.q);
      if ($scope.sdCtrl.togglePC) {return}
      Question.remove({id: this.currentItem.q.id, 
        survey_id: $scope.survey.id}, function(r) {
        if (r.success && i > -1) {
          that.currentItem.p.questions.splice(i, 1);
        }
      });
    };

    this.editQ = function() {
      if ($scope.sdCtrl.togglePC || $scope.sdCtrl.isPublished()) {return}
      $scope.sdCtrl.toggleQuestion('Open', null, this.currentItem.q);
    };
    
    this.dupQ = function(event) {
      if ($scope.sdCtrl.togglePC || $scope.sdCtrl.isPublished()) {return}
      var that = this;
      delete this.currentItem.q.id
      Question.save({survey_id: this.currentItem.q.survey_id}, this.currentItem.q, function(q) {
        that.currentItem.p.questions.push(q)
      });
    };

    this.isStandard = function() {
      if($scope.survey) {
       return $scope.survey.type === 'Standard'; 
      }
      return false;
    }

    this.isCurrentPage = function(page) {
      return page === $scope.currentActivePage;
    }

    this.selectPage = function(page) {
      $scope.currentActivePage = page;
    }

    this.toggleRemove = function() {
      if ($scope.sdCtrl.togglePC || $scope.sdCtrl.isPublished()) {return}
      if (this.rpanelState) {
        return this.rpanelState = false;
      }
      this.rpanelState = true;
    };

    this.addPage = function(event) { 
      if ($scope.sdCtrl.togglePC || $scope.sdCtrl.isPublished()) {return}
      $(event.target).tooltip('destroy');
      this.newPage.$save({survey_id: $scope.survey.id}, function(p) {
        if (angular.isUndefined($scope.currentActivePage)) {
          $scope.currentActivePage = p;
        }
        $scope.pages.push(p);
      });
      this.newPage = new SurveyPage();
    };

    this.removePage = function(newPage) {
      if ($scope.sdCtrl.togglePC  || $scope.sdCtrl.isPublished()) {return}
      var page = $scope.currentActivePage
        , i = $scope.pages.indexOf(page)
        , maxPos = undefined;

      if (!angular.isUndefined(newPage) && !page.questions.isEmpty()) {
        maxPos = $filter('orderBy')(newPage.questions, '-position')[0].position;
      };

      SurveyPage.remove({
        id: page.id, 
        survey_id: page.survey_id,
        newPage: (newPage ? newPage.id : undefined), 
        count: page.questions.length, 
        maxPos: maxPos
      }, function(r) {
        if (r.success ) {
          if (!angular.isUndefined(newPage) && !page.questions.isEmpty()) {
            page.questions.forEach(function(v, i) {
              v.position += (maxPos + 1);
            });
            newPage.questions = newPage.questions.concat(page.questions);
          };
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

    this.isType = function(a, b) {
      return a === b;
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
        this.changed = $scope.sdCtrl.updatePosition();
      }
    };

    this.cancel = function() {
      $scope.sdCtrl.resetSurvey();
    };
  });

  sc.controller('QuestionFormController', function($scope) {
    this.choiceTypes = choiceTypes;
    this.presets = presetQuestions;

    this.save = function(event, close) {
      if ($scope.isInValid()) { return } 
      $scope.sdCtrl.saveQuestion(event, close)
    };

    this.update = function(event) {
      if ($scope.isInValid()) { return } 
      $scope.sdCtrl.updateQuestion(event, close)
    };

    this.isChecked = function(preset) {
      return $scope.currentPQ === preset;
    };

    this.selectType = function() {
      $scope.currentPQ = undefined;     
      switch ($scope.q.type) {
        case 'MRS':
          $scope.q.choices = {};
          $scope.q.choices.ratings = [];
          $scope.q.choices.subqs = [];
          break;        
        case 'SRS':
          $scope.q.choices = {};
          $scope.q.choices.ratings = [];
          break;
        case 'CONTACT':
          $scope.q.choices = [{id:'A01', value: 'Name'}, {id:'A02', value: 'Email'}];
          break;
        default:
          $scope.q.question = '';
          $scope.q.choices = [];
      }
        
    }

    this.usePreset = function(preset, Qtype) {
      $scope.q.type = Qtype;
      $scope.currentPQ = preset;
     
      switch ($scope.currentPQ) {
        case 'YN':
          $scope.q.question = '';
          $scope.q.choices = [{id:'A01', value: 'Yes'}, {id:'A02', value: 'No'}];
          break;
        case 'GEN':
          $scope.q.question = "What is your gender?";
          $scope.q.choices = [{id:'A01', value: 'Male'}, {id:'A02', value: 'Female'}];
          break;
        case 'GEO':
          $scope.q.question = 'Where are you currently located?';
          $scope.q.choices = COUNTRIES; 
          break;
        case 'AGE': 
          $scope.q.question = 'Which of the follow best describes your current age?';
          $scope.q.choices = AGES; 
          break;
        case 'MAR': 
          $scope.q.question = 'Which of the follow best describes you?';
          $scope.q.choices = MARITAL; 
          break;
        case 'EDU':
          $scope.q.question = 'Which of the follow best describes you?';
          $scope.q.choices = EDU; 
          break;
      }
    }

    this.numericScale = function(m) {
      $scope.q.choices.ratings = [];
      for (var i = 1; i <= m; i++) {
        $scope.q.choices.ratings.push({id:'A' + i, value: i})
      }
    };
    this.toShow = function(list) {
      return list.indexOf($scope.q.type) > -1;
    };

    this.showRatingType = function(type) {
      if ($scope.q.choices) {
        return $scope.q.choices.type === type;
      }
    };

    this.addChoices = function(event, type) {
      var input = $(event.target).siblings('textarea');
      if (input.val() && $scope.q.type) {
        var choices = input.val().replace(/\r\n/g, "\n").split("\n");
        choices.forEach(function(v, k) {
          if (v === '') {return}
          getChoicesType(type).push(prepareAnswer(type, v));
        });
     
        input.val('');
      }
    };

    this.clearChoices = function(type) {
      if (type === 'choices') {
        $scope.q.choices = [];
      } else {
        $scope.q.choices[type] = [];
      }
    };

    function getChoicesType(type) {
      return (type === 'choices') ? $scope.q.choices : $scope.q.choices[type];
    };

    function prepareAnswer(type, val) {
      var t = type.charAt(0).toUpperCase();
      var key = t + Math.floor((Math.random() * 1000) + 1);
      var item = {};
      item['value'] = val;
      item['id'] = key;
      return item;
    }

  });

  function updateSurveyStatus(s, Survey, fn) {
   
  };

  var choiceTypes = [
    { id: 'SC', name: 'Single Choice', value: 'SC'}, 
    { id: 'MC', name: 'Multiple Choice', value: 'MC'}, 
    { id: 'SA', name: 'Short Answer', value: 'SA' }, 
    { id: 'LA', name: 'Long Answer', value: 'LA' }, 
    { id: 'DD', name: 'Dropdown', value: 'DD' },
    { id: 'SRS', name: 'Single (Rating Scale)', value: 'SRS' }, 
    { id: 'MRS', name: 'Matrix (Rating Scale)', value: 'MRS' },
    { id: 'CONTACT', name: 'Name/Email', value: 'CONTACT' } 
  ];

  var presetQuestions = [
    { id: 'YN', name: 'Yes/No', value: 'SC' },
    { id: 'GEO', name: 'Countries', value: 'DD' },
    { id: 'GEN', name: 'Gender', value: 'SC' },
    { id: 'EDU', name: 'Education', value: 'DD' },
    { id: 'MAR', name: 'Martial', value: 'DD' },
    { id: 'AGE', name: 'Age', value: 'DD' } 
  ]  

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

  var COUNTRIES = [ 
    {"value": "Afghanistan", "id": "AF"}, 
    {"value": "Åland Islands", "id": "AX"}, 
    {"value": "Albania", "id": "AL"}, 
    {"value": "Algeria", "id": "DZ"}, 
    {"value": "American Samoa", "id": "AS"}, 
    {"value": "AndorrA", "id": "AD"}, 
    {"value": "Angola", "id": "AO"}, 
    {"value": "Anguilla", "id": "AI"}, 
    {"value": "Antarctica", "id": "AQ"}, 
    {"value": "Antigua and Barbuda", "id": "AG"}, 
    {"value": "Argentina", "id": "AR"}, 
    {"value": "Armenia", "id": "AM"}, 
    {"value": "Aruba", "id": "AW"}, 
    {"value": "Australia", "id": "AU"}, 
    {"value": "Austria", "id": "AT"}, 
    {"value": "Azerbaijan", "id": "AZ"}, 
    {"value": "Bahamas", "id": "BS"}, 
    {"value": "Bahrain", "id": "BH"}, 
    {"value": "Bangladesh", "id": "BD"}, 
    {"value": "Barbados", "id": "BB"}, 
    {"value": "Belarus", "id": "BY"}, 
    {"value": "Belgium", "id": "BE"}, 
    {"value": "Belize", "id": "BZ"}, 
    {"value": "Benin", "id": "BJ"}, 
    {"value": "Bermuda", "id": "BM"}, 
    {"value": "Bhutan", "id": "BT"}, 
    {"value": "Bolivia", "id": "BO"}, 
    {"value": "Bosnia and Herzegovina", "id": "BA"}, 
    {"value": "Botswana", "id": "BW"}, 
    {"value": "Bouvet Island", "id": "BV"}, 
    {"value": "Brazil", "id": "BR"}, 
    {"value": "British Indian Ocean Territory", "id": "IO"}, 
    {"value": "Brunei Darussalam", "id": "BN"}, 
    {"value": "Bulgaria", "id": "BG"}, 
    {"value": "Burkina Faso", "id": "BF"}, 
    {"value": "Burundi", "id": "BI"}, 
    {"value": "Cambodia", "id": "KH"}, 
    {"value": "Cameroon", "id": "CM"}, 
    {"value": "Canada", "id": "CA"}, 
    {"value": "Cape Verde", "id": "CV"}, 
    {"value": "Cayman Islands", "id": "KY"}, 
    {"value": "Central African Republic", "id": "CF"}, 
    {"value": "Chad", "id": "TD"}, 
    {"value": "Chile", "id": "CL"}, 
    {"value": "China", "id": "CN"}, 
    {"value": "Christmas Island", "id": "CX"}, 
    {"value": "Cocos (Keeling) Islands", "id": "CC"}, 
    {"value": "Colombia", "id": "CO"}, 
    {"value": "Comoros", "id": "KM"}, 
    {"value": "Congo", "id": "CG"}, 
    {"value": "Congo, The Democratic Republic of the", "id": "CD"}, 
    {"value": "Cook Islands", "id": "CK"}, 
    {"value": "Costa Rica", "id": "CR"}, 
    {"value": "Cote D\"Ivoire", "id": "CI"}, 
    {"value": "Croatia", "id": "HR"}, 
    {"value": "Cuba", "id": "CU"}, 
    {"value": "Cyprus", "id": "CY"}, 
    {"value": "Czech Republic", "id": "CZ"}, 
    {"value": "Denmark", "id": "DK"}, 
    {"value": "Djibouti", "id": "DJ"}, 
    {"value": "Dominica", "id": "DM"}, 
    {"value": "Dominican Republic", "id": "DO"}, 
    {"value": "Ecuador", "id": "EC"}, 
    {"value": "Egypt", "id": "EG"}, 
    {"value": "El Salvador", "id": "SV"}, 
    {"value": "Equatorial Guinea", "id": "GQ"}, 
    {"value": "Eritrea", "id": "ER"}, 
    {"value": "Estonia", "id": "EE"}, 
    {"value": "Ethiopia", "id": "ET"}, 
    {"value": "Falkland Islands (Malvinas)", "id": "FK"}, 
    {"value": "Faroe Islands", "id": "FO"}, 
    {"value": "Fiji", "id": "FJ"}, 
    {"value": "Finland", "id": "FI"}, 
    {"value": "France", "id": "FR"}, 
    {"value": "French Guiana", "id": "GF"}, 
    {"value": "French Polynesia", "id": "PF"}, 
    {"value": "French Southern Territories", "id": "TF"}, 
    {"value": "Gabon", "id": "GA"}, 
    {"value": "Gambia", "id": "GM"}, 
    {"value": "Georgia", "id": "GE"}, 
    {"value": "Germany", "id": "DE"}, 
    {"value": "Ghana", "id": "GH"}, 
    {"value": "Gibraltar", "id": "GI"}, 
    {"value": "Greece", "id": "GR"}, 
    {"value": "Greenland", "id": "GL"}, 
    {"value": "Grenada", "id": "GD"}, 
    {"value": "Guadeloupe", "id": "GP"}, 
    {"value": "Guam", "id": "GU"}, 
    {"value": "Guatemala", "id": "GT"}, 
    {"value": "Guernsey", "id": "GG"}, 
    {"value": "Guinea", "id": "GN"}, 
    {"value": "Guinea-Bissau", "id": "GW"}, 
    {"value": "Guyana", "id": "GY"}, 
    {"value": "Haiti", "id": "HT"}, 
    {"value": "Heard Island and Mcdonald Islands", "id": "HM"}, 
    {"value": "Holy See (Vatican City State)", "id": "VA"}, 
    {"value": "Honduras", "id": "HN"}, 
    {"value": "Hong Kong", "id": "HK"}, 
    {"value": "Hungary", "id": "HU"}, 
    {"value": "Iceland", "id": "IS"}, 
    {"value": "India", "id": "IN"}, 
    {"value": "Indonesia", "id": "ID"}, 
    {"value": "Iran, Islamic Republic Of", "id": "IR"}, 
    {"value": "Iraq", "id": "IQ"}, 
    {"value": "Ireland", "id": "IE"}, 
    {"value": "Isle of Man", "id": "IM"}, 
    {"value": "Israel", "id": "IL"}, 
    {"value": "Italy", "id": "IT"}, 
    {"value": "Jamaica", "id": "JM"}, 
    {"value": "Japan", "id": "JP"}, 
    {"value": "Jersey", "id": "JE"}, 
    {"value": "Jordan", "id": "JO"}, 
    {"value": "Kazakhstan", "id": "KZ"}, 
    {"value": "Kenya", "id": "KE"}, 
    {"value": "Kiribati", "id": "KI"}, 
    {"value": "Korea, Democratic People\"S Republic of", "id": "KP"}, 
    {"value": "Korea, Republic of", "id": "KR"}, 
    {"value": "Kuwait", "id": "KW"}, 
    {"value": "Kyrgyzstan", "id": "KG"}, 
    {"value": "Lao People\"S Democratic Republic", "id": "LA"}, 
    {"value": "Latvia", "id": "LV"}, 
    {"value": "Lebanon", "id": "LB"}, 
    {"value": "Lesotho", "id": "LS"}, 
    {"value": "Liberia", "id": "LR"}, 
    {"value": "Libyan Arab Jamahiriya", "id": "LY"}, 
    {"value": "Liechtenstein", "id": "LI"}, 
    {"value": "Lithuania", "id": "LT"}, 
    {"value": "Luxembourg", "id": "LU"}, 
    {"value": "Macao", "id": "MO"}, 
    {"value": "Macedonia, The Former Yugoslav Republic of", "id": "MK"}, 
    {"value": "Madagascar", "id": "MG"}, 
    {"value": "Malawi", "id": "MW"}, 
    {"value": "Malaysia", "id": "MY"}, 
    {"value": "Maldives", "id": "MV"}, 
    {"value": "Mali", "id": "ML"}, 
    {"value": "Malta", "id": "MT"}, 
    {"value": "Marshall Islands", "id": "MH"}, 
    {"value": "Martinique", "id": "MQ"}, 
    {"value": "Mauritania", "id": "MR"}, 
    {"value": "Mauritius", "id": "MU"}, 
    {"value": "Mayotte", "id": "YT"}, 
    {"value": "Mexico", "id": "MX"}, 
    {"value": "Micronesia, Federated States of", "id": "FM"}, 
    {"value": "Moldova, Republic of", "id": "MD"}, 
    {"value": "Monaco", "id": "MC"}, 
    {"value": "Mongolia", "id": "MN"}, 
    {"value": "Montserrat", "id": "MS"}, 
    {"value": "Morocco", "id": "MA"}, 
    {"value": "Mozambique", "id": "MZ"}, 
    {"value": "Myanmar", "id": "MM"}, 
    {"value": "Namibia", "id": "NA"}, 
    {"value": "Nauru", "id": "NR"}, 
    {"value": "Nepal", "id": "NP"}, 
    {"value": "Netherlands", "id": "NL"}, 
    {"value": "Netherlands Antilles", "id": "AN"}, 
    {"value": "New Caledonia", "id": "NC"}, 
    {"value": "New Zealand", "id": "NZ"}, 
    {"value": "Nicaragua", "id": "NI"}, 
    {"value": "Niger", "id": "NE"}, 
    {"value": "Nigeria", "id": "NG"}, 
    {"value": "Niue", "id": "NU"}, 
    {"value": "Norfolk Island", "id": "NF"}, 
    {"value": "Northern Mariana Islands", "id": "MP"}, 
    {"value": "Norway", "id": "NO"}, 
    {"value": "Oman", "id": "OM"}, 
    {"value": "Pakistan", "id": "PK"}, 
    {"value": "Palau", "id": "PW"}, 
    {"value": "Palestinian Territory, Occupied", "id": "PS"}, 
    {"value": "Panama", "id": "PA"}, 
    {"value": "Papua New Guinea", "id": "PG"}, 
    {"value": "Paraguay", "id": "PY"}, 
    {"value": "Peru", "id": "PE"}, 
    {"value": "Philippines", "id": "PH"}, 
    {"value": "Pitcairn", "id": "PN"}, 
    {"value": "Poland", "id": "PL"}, 
    {"value": "Portugal", "id": "PT"}, 
    {"value": "Puerto Rico", "id": "PR"}, 
    {"value": "Qatar", "id": "QA"}, 
    {"value": "Reunion", "id": "RE"}, 
    {"value": "Romania", "id": "RO"}, 
    {"value": "Russian Federation", "id": "RU"}, 
    {"value": "RWANDA", "id": "RW"}, 
    {"value": "Saint Helena", "id": "SH"}, 
    {"value": "Saint Kitts and Nevis", "id": "KN"}, 
    {"value": "Saint Lucia", "id": "LC"}, 
    {"value": "Saint Pierre and Miquelon", "id": "PM"}, 
    {"value": "Saint Vincent and the Grenadines", "id": "VC"}, 
    {"value": "Samoa", "id": "WS"}, 
    {"value": "San Marino", "id": "SM"}, 
    {"value": "Sao Tome and Principe", "id": "ST"}, 
    {"value": "Saudi Arabia", "id": "SA"}, 
    {"value": "Senegal", "id": "SN"}, 
    {"value": "Serbia and Montenegro", "id": "CS"}, 
    {"value": "Seychelles", "id": "SC"}, 
    {"value": "Sierra Leone", "id": "SL"}, 
    {"value": "Singapore", "id": "SG"}, 
    {"value": "Slovakia", "id": "SK"}, 
    {"value": "Slovenia", "id": "SI"}, 
    {"value": "Solomon Islands", "id": "SB"}, 
    {"value": "Somalia", "id": "SO"}, 
    {"value": "South Africa", "id": "ZA"}, 
    {"value": "South Georgia and the South Sandwich Islands", "id": "GS"}, 
    {"value": "Spain", "id": "ES"}, 
    {"value": "Sri Lanka", "id": "LK"}, 
    {"value": "Sudan", "id": "SD"}, 
    {"value": "Suriname", "id": "SR"}, 
    {"value": "Svalbard and Jan Mayen", "id": "SJ"}, 
    {"value": "Swaziland", "id": "SZ"}, 
    {"value": "Sweden", "id": "SE"}, 
    {"value": "Switzerland", "id": "CH"}, 
    {"value": "Syrian Arab Republic", "id": "SY"}, 
    {"value": "Taiwan, Province of China", "id": "TW"}, 
    {"value": "Tajikistan", "id": "TJ"}, 
    {"value": "Tanzania, United Republic of", "id": "TZ"}, 
    {"value": "Thailand", "id": "TH"}, 
    {"value": "Timor-Leste", "id": "TL"}, 
    {"value": "Togo", "id": "TG"}, 
    {"value": "Tokelau", "id": "TK"}, 
    {"value": "Tonga", "id": "TO"}, 
    {"value": "Trinidad and Tobago", "id": "TT"}, 
    {"value": "Tunisia", "id": "TN"}, 
    {"value": "Turkey", "id": "TR"}, 
    {"value": "Turkmenistan", "id": "TM"}, 
    {"value": "Turks and Caicos Islands", "id": "TC"}, 
    {"value": "Tuvalu", "id": "TV"}, 
    {"value": "Uganda", "id": "UG"}, 
    {"value": "Ukraine", "id": "UA"}, 
    {"value": "United Arab Emirates", "id": "AE"}, 
    {"value": "United Kingdom", "id": "GB"}, 
    {"value": "United States", "id": "US"}, 
    {"value": "United States Minor Outlying Islands", "id": "UM"}, 
    {"value": "Uruguay", "id": "UY"}, 
    {"value": "Uzbekistan", "id": "UZ"}, 
    {"value": "Vanuatu", "id": "VU"}, 
    {"value": "Venezuela", "id": "VE"}, 
    {"value": "Viet Nam", "id": "VN"}, 
    {"value": "Virgin Islands, British", "id": "VG"}, 
    {"value": "Virgin Islands, U.S.", "id": "VI"}, 
    {"value": "Wallis and Futuna", "id": "WF"}, 
    {"value": "Western Sahara", "id": "EH"}, 
    {"value": "Yemen", "id": "YE"}, 
    {"value": "Zambia", "id": "ZM"}, 
    {"value": "Zimbabwe", "id": "ZW"} 
  ];

  var AGES = [
    {id:'A01', value: '12 - 17'},
    {id:'A02', value: '18 - 24'}, 
    {id:'A03', value: '25 - 34'}, 
    {id:'A04', value: '35 - 44'}, 
    {id:'A05', value: '45 - 54'}, 
    {id:'A06', value: '55 - 64'}, 
    {id:'A07', value: '65 - 74'}, 
    {id:'A08', value: '75+'}
  ];

  var EDU = [
    {id:'A01', value: 'Some high school'},
    {id:'A02', value: 'High school graduate'}, 
    {id:'A03', value: 'Some college'}, 
    {id:'A04', value: 'Trade, technical, vocational training'}, 
    {id:'A05', value: 'College graduate'}, 
    {id:'A06', value: 'Some postgraduate work'}, 
    {id:'A07', value: 'Post graduate degress'}, 
    {id:'A08', value: 'Master’s degree'},
    {id:'A09', value: 'Doctorate degree'}
  ];  

  var MARITAL = [
    {id:'A01', value: 'Single'},
    {id:'A02', value: 'Married or domestic partnership'}, 
    {id:'A03', value: 'Widowed'}, 
    {id:'A04', value: 'Divorced'}, 
    {id:'A05', value: 'Separated'}
  ];

})();

