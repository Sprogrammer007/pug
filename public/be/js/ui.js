
(function($) {
  
  function UIEditor() {
    var mainMenu = $('.main-menu');
    var navBar = $('#header');
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
   
      $('.body-content').css({
        'height': (h - 170)
      });

      $('.body-content').TrackpadScrollEmulator('recalculate');
      $('#mainBody').TrackpadScrollEmulator('recalculate');
    };
  }
  
 
   
  $(document).ready(function() { 
    var editor = new UIEditor();
    editor.init();

    $(window).resize(function() {
      editor.resizeUI(window.innerWidth, window.innerHeight)
    });
  });

})(jQuery);