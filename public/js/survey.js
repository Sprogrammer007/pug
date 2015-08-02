

+function ($) {

  'use strict';

  // Multi Step Survey
  // ====================

  var Survey = function (element) {
    this.currentQNum = 0;
    this.element = $(element);
    this.totalQs = element.find('.question').length;
    this.progressBy = Math.round((100/this.totalQs) * 100 ) / 100;
    this.timer = null;

    this.updateProgres = function() {
      this.currentQNum++
      var percent = Math.round((this.progressBy*this.currentQNum) * 100 ) /100;
      if (this.currentQNum === this.totalQs) {
        $('.progress-bar').css({width: '100%'});
        $('.progress-bar').text('100%');
      } else {
        $('.progress-bar').css({width: (percent)+"%"});
        $('.progress-bar').text((percent)+"%");
      }
     
    };

    this.next = function(current) {
      var $next = current.next();
      var hideEvent = $.Event('hide.quest', {
        relatedTarget: current[0]
      })
      var showEvent = $.Event('show.quest', {
        relatedTarget: $next[0]
      })

      $next.trigger(hideEvent)
      current.trigger(showEvent)
      current.removeClass('active');
      $next.addClass('active');
      this.updateProgres();
    };

    this.radioCheckBoxLogic = function(parent, element) {
      var that = this;

      if (element.val() !== 'other') {
        this.timer = setTimeout(function() {
          that.next(parent);
        }, 3200);
      } else {
        parent.append('<input type="text" placeHolder="Tell us more" class="form-control"/>')
      } 
    };

    this.multiQLogic = function(parent, element) {
      var totalAnswersNeeded = parent.find('.subquestion').length;
      var answered = parent.find('input[type="radio"]:checked').length;;
      if (answered < totalAnswersNeeded) return
      this.next(parent)

    };

    this.multiPartLogic = function(parent, element) {
      var subquestion = element.data('subq');
      if (subquestion) {
        parent.append(subquestion);
      } else {  
        this.next(parent);
      }
    };

    this.textLogic = function(parent, element) {
      var that = this;
      this.timer = setTimeout(function() {
        that.next(parent);
      }, 3000);
    };

    function answerListener(e) {
      var $this = e.data.survey;
      window.clearTimeout($this.timer);
      $this.answerCheck($(this));
    };

    element.on('click', 'input', {survey: this}, answerListener);
    element.on('keydown', 'input[type="text"]', {survey: this}, answerListener)
    element.on('change', 'select', {survey: this}, answerListener)
  }

  Survey.VERSION = '1.0'

  Survey.TRANSITION_DURATION = 150

  Survey.prototype.answerCheck = function (element) {
    var $this = element;
    var parent = element.parents('.question');
    var questionType = parent.data('type');
    var that = this;

    if (!parent.hasClass('active')) return

    if ($this.attr('type') === 'checkbox' || $this.attr('type') === 'radio') {
      switch(questionType) {
        case 'multiA':
          this.radioCheckBoxLogic(parent, $this);
          break;
        case 'multiQ':
          this.multiQLogic(parent, $this);
          break;
        case 'multiPart':
          this.multiPartLogic(parent, $this);
          break; 
        default:
          this.next(parent);
      }
    } else {
      this.textLogic(parent, $this)
    }
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(options) {
    new Survey(this)
    return this;
  }


  $.fn.survey             = Plugin

  // TAB DATA-API
  // ============


}(jQuery);

jQuery('form').survey();