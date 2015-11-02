
;(function($) {
  "use strict";
  
  $(document).ready(function() {

    $('[data-toggle="tooltip"]').tooltip();
    // Optin

    function openOptin() {
      var seen = getCookie('o_shown');
      if (seen) return;
      setCookie('o_shown', 'yes', 2);
      $('#poptin').modal('show');
    }
    if ($('#poptin').attr('data-pon') === "On") {
     setTimeout(openOptin, 3*15*1000);
    };

    $('.boptin').on('click', function(e) { 
      $('#poptin').modal('show');
    });

    function reposition() {
      var modal = $(this),
      dialog = modal.find('.modal-dialog');
      modal.css('display', 'block');
      dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
    }

    // Reposition when a modal is shown
    $('.modal').on('show.bs.modal', reposition);
    // Reposition when the window is resized
    $(window).on('resize', function() {
      $('.modal:visible').each(reposition);
    });

    // Password Validator
    $('input.require-field').focus(function(e) {
      var parent = $(this).parent();

      if (parent.hasClass('has-errors')) {
        parent.removeClass('has-errors')
      }

      if ($(this).hasClass('password')) {
        parent.addClass('active')
      }
    });       

    $('input.password').blur(function(e) {
      $(this).parent('.form-group').removeClass('active')
    });    

    $('input.password').keyup(function(e) {
      passwordValidation($(this));
    });



    $("form#validate").submit(function(e) {
      var that = $(this)
        , async = that.data('async')
        , errBox = $('.notify-box.error');

      //reset errors
      errBox.html('');
      if (invalidForm(that)) {
        e.preventDefault();
        return false 
      };

      var send_data = $(this).serialize();
      if (async) {
        e.preventDefault();
        $.post(window.location.origin + that.attr('action'), send_data, function(data){
          if( data.success ){
            that.hide();
            $('.success-msg.pass-reset').addClass('active');
          }else{
            var err = '<li><i class="fa fa-exclamation-circle"></i> ' + data.message + '</li>';
            errBox.append(err);
          }
        }, 'json');
        return false;
      } else {
        return true;
      }
    });

    $("form#contact-form").submit(function(){

      var that = $(this)
      if (invalidForm(that)) { return false };

      var send_data = $(this).serialize();
  
      $.post(window.location.origin + '/contact_mailer', send_data, function(data){
        if( data.success == '1' ){
          
          that.hide();
          $('.success').show();
        }else{
          $('.failure').show();
        }
      }, 'json');
      return false;
    });
  
  });

})(jQuery);