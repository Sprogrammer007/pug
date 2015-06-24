
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

  function setCookie(name, value, days) {
    var now = new Date();
    var expireDate= new Date();
    expireDate.setTime(now.getTime() + days*24*60*60*1000); 
    var curCookie = name + "=" + escape(value) + ";path=/;domain=.designedforresult.com;expires=" + expireDate; 
    document.cookie = curCookie;
  }


  function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
      begin = dc.indexOf(prefix);
      if (begin != 0) return null;
    } else
      begin += 2;
    var end = document.cookie.indexOf(";", begin);
    if (end == -1)
      end = dc.length;
    return unescape(dc.substring(begin + prefix.length, end));
  }

  function openOptin() {
    if (!$('#poptin').attr('data-pon')) return;
    var seen = getCookie('o_shown');
    if (seen) return;
    setCookie('o_shown', 'yes', 2);
    $('#poptin').modal('show');
  }

    
  $(document).ready(function() {
    // Optin
    setTimeout(openOptin, 3*15*1000);

    $('#poptin').on('click', '.btn-yes', function(e) {

      if ($('#poptin .step2').length === 0 ) return;
      dataLayer.push({
        'event':'VirtualPageview',
        'virtualPageURL':'/website_planner',
        'virtualPageTitle' : 'Website Planner Optin'
      });
      $('#poptin .step1').hide("slide", { direction: "left" }, 1200);
      $('#poptin .step2').delay(400).show("slide", { direction: "right" }, 1200);;
      $('.modal-body').delay(400).animate({ height: 'auto' }, 1200 );
      $('#poptin .step2').delay(400).css('position', 'relative');
    });

    $('.boptin').on('click', function(e) { 
      $('#poptin .step1').hide();
      $('#poptin .step2').show();
      dataLayer.push({
        'event':'VirtualPageview',
        'virtualPageURL':'/website_planner',
        'virtualPageTitle' : 'Website Planner Optin'
      });
      $('#poptin .step2').delay(400).css('position', 'relative');
      $('.modal-body').css('height', 'auto');
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

    // Sharrre

    $('.twitter').sharrre({
      share: {
        twitter: true
      },
      enableHover: false,
      enableTracking: true,
      buttons: { twitter: {via: ''}},
      template: '<a class="box" href="#"><i class="social-icon fa fa-twitter"></i><span class="count" href="#">{total}</span></a>',

      click: function(api, options){
        api.simulateClick();
        api.openPopup('twitter');
      }
    });


    $('.facebook').sharrre({
      share: {
        facebook: true
      },
      enableHover: false,
      enableTracking: true,
      template: '<a class="box" href="#"><i class="social-icon fa fa-facebook"></i><span class="count" href="#">{total}</span></a>',

      click: function(api, options){
        api.simulateClick();
        api.openPopup('facebook');
      }
    });
  
    $('.linkedin').sharrre({
      share: {
        linkedin: true
      },

      enableHover: false,
      enableTracking: true,
      template: '<a class="box" href="#"><i class="social-icon fa fa-linkedin"></i><span class="count" href="#">{total}</span></a>',

      click: function(api, options){
        api.simulateClick();
        api.openPopup('linkedin');
      }
    });


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
    jQuery("form#optin-form").submit(function(){

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
    });

    jQuery("form#contact-form").submit(function(){

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


    // Social Fix Scroller
    if ($('#social').length > 0 ) { 
      (function(){

        var position = $('.post-title').offset();
        var width = $('.post-title').width();
        var position2 = $('#post-footer-share').offset();

        if (isMobile.any()) {
          $('#social').css({
            'left': 0,
            'bottom': 0
          });
        } else{
          $('#social').css({
            'top': position.top,
            'left': position.left + width + 80
          });
         }

        $(window).on('scroll', function() {
          if (isMobile.any()) {
            if ( $(window).scrollTop() > (position.top - 100) && $(window).scrollTop() < (position2.top - $(window).height() + 20)) {
              $('#social').addClass('fixed');
            } else {
              $('#social').removeClass('fixed');
            };
          } else {
            if ( $(window).scrollTop() > (position.top - 100) ) {
              $('#social').addClass('fixed');
            } else {
              $('#social').removeClass('fixed');
            };
          }
        });

        //google plus counter
        var url = 'https://plusone.google.com/_/+1/fastbutton?url=https://' + $('.googleplus').attr('data-url');
        jQuery.getJSON('http://anyorigin.com/get?callback=?&url=' + encodeURIComponent(url), function (data){
          $('.googleplus').find('.count').text(data.contents.match(/{c: (\d+)/)[1]);
        });

      })();
    }
    // Google plus share
    $('.googleplus').on('click', function(e) {
      window.open("https://plus.google.com/share?url=" + $('.facebook').attr('data-url'), "_blank", "top=0, left=500,width=600, height=400")
    });
  
  });

})(jQuery);