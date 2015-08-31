
(function($) {
  
  function UIEditor() {
    var mainMenu = $('.main-menu');
    var navBar = $('#header');
    var pageList = $('.page-list');
    var timeoutID;
    this.init = function() {
      this.resizeUI(window.innerWidth, window.innerHeight)
      $('.main-content').css({
        'margin-top': + mainMenu.height() + 20,
        'backface-visibility': 'hidden'
      });

    };

    this.resizeUI = function(w, h) {
      $('#mainBody').css({
        'width': w,
        'height': (h - navBar.height())
      });  

      $('.main-menu').css({
        'clip': 'rect(0px ' + w + 'px 109px 0px)'
      });

      clearTimeout(timeoutID);
      timeoutID = setTimeout(function() {
        if (pageList.length > 0) {
          $('.survey-buttons').css({
            'left': pageList.offset().left + pageList.width() + 10
          });

          $('.mini-map').css({
            'left': pageList.offset().left + pageList.width() + 10,
            'top': pageList.scrollTop() + 115
          }); 
        }
  
      }, 5);
   
      $('.body-content').css({
        'height': (h - 170)
      });

      $('.body-content').TrackpadScrollEmulator('recalculate');
      $('#mainBody').TrackpadScrollEmulator('recalculate');
    };
  }
  
 
   
  $(document).ready(function() { 
    var editor = new UIEditor();
    var id;
    editor.init();

    $(window).resize(function() {
      editor.resizeUI(window.innerWidth, window.innerHeight)
    });


  });

})(jQuery);