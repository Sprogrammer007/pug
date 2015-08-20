
(function($) {
  $('#mainContent').TrackpadScrollEmulator();

  function UIEditor() {

    this.init = function() {
      this.resizeUI(window.innerWidth, window.innerHeight)
    };

    this.resizeUI = function(w, h) {
      $('#mainContent').css({
        'width': w,
        'height': (h - 60)
      });  

      $('.body-content').css({
        'height': (h - 170)
      });
      $('.body-content').TrackpadScrollEmulator('recalculate');
      $('#mainContent').TrackpadScrollEmulator('recalculate');
    };
  }

  $(document).ready(function() { 


    var editor = new UIEditor();
    editor.init();


    window.onresize = function(event) {
      editor.resizeUI(window.innerWidth, window.innerHeight)
    };
  });

})(jQuery);