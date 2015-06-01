
(function($) {
  var isMobile = {
    Mobile: function() {
        return navigator.userAgent.match(/Mobile/i);
    },
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    Kindle: function() {
        return navigator.userAgent.match(/Kindle/i);
    }, 
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Omobile: function() {
        return navigator.userAgent.match(/Opera Mobi/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Mobile() || isMobile.Kindle() || isMobile.Omobile() || isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
  };

    
  $(document).ready(function() {

    if (location.pathname === "/") {
      var anchor_offset = $(window).height() * 0.6 ;
      $(window).on('scroll', function() {
        if ( $(window).scrollTop() > anchor_offset ) {
          $('.navbar').addClass('sticky');
        } else {
          if(isMobile.any()) { return };
 
          $('.navbar').removeClass('sticky');
        };
      });
    }
   
    $('[data-toggle="tooltip"]').tooltip();

    wow = new WOW({
      boxClass:     'wow',      // default
      animateClass: 'animated', // default
      offset:       0,          // default
      mobile:       true,       // default
      live:         true        // default
    });
    wow.init();

    // Submit Form
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    var phoneReg = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

    jQuery("form#contact-form").submit(function(){
      console.log(window.location.origin);
      var error = false;
      var that = jQuery(this)
      jQuery(this).find('.require-field').each(function(){
        if(jQuery.trim(jQuery(this).val()) == '') {
          error = true;
          $(this).tooltip('show');
        } else if(jQuery(this).hasClass('email')) {
          if(!emailReg.test(jQuery.trim(jQuery(this).val()))) {
            error = true;
            $(this).tooltip('show');
          }
        } else if(jQuery(this).hasClass('phone')) {
          if(!phoneReg.test(jQuery.trim(jQuery(this).val()))) {
            error = true;
            $(this).tooltip('show');
          }
        }
      });
      
      if(error) return false;

      var send_data = jQuery(this).serialize();
      $(this).find('.btn-reserve').append("<div class='loader8'></div>")
  
      jQuery.post(window.location.origin + '/contact_mailer', send_data, function(data){
        if( data.success == '1' ){
          that.hide();
          $('.success').show();
          dataLayer.push({
            'event':'VirtualPageview',
            'virtualPageURL':'/speedtest/done',
            'virtualPageTitle' : 'Order Complete'
          });
        }else{
          $('.failure').show();
        }
      }, 'json');
      
      
      return false;
    });

    //Thank You Page

    $('.require-field').on('focus', function(e) {
      $(this).tooltip('hide');
    });

    $('#thankyouform').submit(function(e) {
      e.preventDefault();
      var the_form = $(this);
      var error = false;

      $(this).find('.require-field').each(function(){
        if($.trim($(this).val()) == '') {
          error = true;
          $(this).tooltip('show');
        }
      });

      if(error) return false;
      var send_data = $(this).serialize();
      var url = $(this).attr('action')
      $.post(url, send_data, function(data){
        if( data.success == '1' ){
          the_form.parent().remove();
          $('.success').show();
          dataLayer.push({
            'event':'VirtualPageview',
            'virtualPageURL':'/wireframe/thank-you-done',
            'virtualPageTitle' : 'Order Complete'
          });
        }else{
          $('.failure').show();
        }
      }, 'json');

    });    

    $('.website-url').change(function(e){
      var val = $(this).val();
      $(this).val(val.replace(/.*?:\/\//g, ""))
    });


    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    };  

    function analize(form, time){

      var max_errors = getRandomInt(8,16),
        xx = false,
        percent = 0.0, 
        errors = 0,
        i = 0,
        j = 0,  
        jj = 0,
        k = 0,
        bar = document.getElementById('progressbar'),
        aa  = document.getElementById('analyzer-errors'),
        times = [];

        for( i = 0; i <= max_errors; i++) {
          times.push(getRandomInt(5,25)*time)
        }

        times.sort(function() {
            return .2 - Math.random();
        });

        var progress = setInterval(function() {
          if( ++i < 25*time || ( i > 50*time && i < 85*time ) || i > 135*time ){
            percent = Math.round( (percent+1/time) * 10 ) / 10;
            j++;
            bar.style.width = percent+'%';  

            if( xx && errors < max_errors && j>=jj ){
              errors++;
              jj += times[k++]*time/max_errors;
              text = (errors > 1) ? "errors" : "error";
              aa.innerHTML = errors+" "+text+" found&hellip;";
            }
          }

          if( !xx && i > 40 ){
            xx= true;
            jj =j;
            aa.classList.remove("hide");
          }

          if ( percent >= 100 ) {
            clearInterval(progress);
            $('.analyzer .warning-title').html('Preparing your report please be patient...')
            form.submit();
          }

        }, 5);
                    
      };
    $('#speedtest button').on('click', function(e) {
      e.preventDefault();
      var form = $('#speedtest');
      var error = false;
      console.log('test');
      form.find('.require-field').each(function(){
        if($.trim($(this).val()) == '') {
          error = true;
          $(this).tooltip('show');
        }
      });

             
      
      if(error) return false;
      form.hide();
      form.parent('.analyzer').append('<p class="warning-title">Analyzing your website&hellip;</p><div id="analyzer-wrap"><div id="progressbar"></div></div><p id="analyzer-errors"><span>1 error</span> found&hellip;</p>');
      analize(form, 9.5);  


    });
  
  });

})(jQuery);