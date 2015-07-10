$(document).ready(function() {

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

  var stepOne = $(".step-one");
  var stepTwo = $(".step-two");
  var activeStep = stepOne;
  var values = {};
  var closeButton = $('.close')
  var backButton = $('.back')
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  var phoneReg = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

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

  setCookie('tpdiscount', 'seen', 365);

  $('input.cc-num').payment('formatCardNumber');
  $('input.cc-exp').payment('formatCardExpiry');
  $('input.cc-cvc').payment('formatCardCVC');

  var oneTwo = function(direction) {
    if (direction === "forward") {
      activeStep.hide("slide", { direction: "left" }, 1200);
      $('.modal-dialog').delay(400).animate({ width: 350  }, 1200 );
      $('.modal-body').delay(400).animate({ height: 200  }, 1200 );
      stepTwo.delay(400).fadeIn(1200);
      closeButton.hide();
      backButton.show();
      activeStep = stepTwo; 
    };

    if (direction === "backward") {
      activeStep.hide("slide", { direction: "left" }, 1200);
      $('.modal-dialog').delay(400).animate({ width: 600  }, 1200 );
      $('.modal-body').delay(400).animate({ height: 280  }, 1200 );
      stepOne.delay(800).fadeIn(1200);
      closeButton.show();
      backButton.hide();
      activeStep = stepOne; 
    }
  };

  var updateValues = function() {
    $("#payment-form").find("input").each(function() {
      values[$(this)[0].name] = $(this).val();
    });
  };

  var issuccess = function(f) {
    $(f).parent('div').removeClass('is-error').addClass('is-success');
  }; 

  var isfail = function(f) {
    $(f).parent('div').removeClass('is-success').addClass('is-error');
  };

  var invalidForm = function(cn, ce, cvc) {
    var error = false;

    if (activeStep === stepTwo) {
      $('form#payment-form').find('.required-cc').each(function(){
        if(jQuery.trim(jQuery(this).val()) == '') {
          error = true;
          isfail(this);
        }else if(jQuery(this).hasClass('cc-num')) {
          if(!$.payment.validateCardNumber(cn)) {
            error = true;
            isfail(this);
          }else{
            issuccess(this);
          }
        }else if(jQuery(this).hasClass('cc-exp')) {
          if(!$.payment.validateCardExpiry(ce)) {
            error = true;
            isfail(this);
          }else{
            issuccess(this);
          }
        }else if(jQuery(this).hasClass('cc-cvc')) {
          if(!$.payment.validateCardCVC(cvc)) {
            error = true;
            isfail(this);
          }else{
            issuccess(this);
          }
        }else{
          issuccess(this);
        }
      });
    } else {
      $('form#payment-form').find('.required-info').each(function(){
        if(jQuery.trim(jQuery(this).val()) == '') {
          error = true;
          isfail(this);
        }else if(jQuery(this).hasClass('email')) {
          if(!emailReg.test(jQuery.trim(jQuery(this).val()))) {
            error = true;
            isfail(this);
          }else{
            issuccess(this);
          }
        }else if(jQuery(this).hasClass('phone')) {
          if(!phoneReg.test(jQuery.trim(jQuery(this).val()))) {
            error = true;
            isfail(this);
          }else{
            issuccess(this);
          }
        }else{
          issuccess(this);
        }
      });
    }
    if(error) {
      $('.modal-dialog').addClass('lets-shake').delay(1000).queue(function(){
        $('.modal-dialog').removeClass("lets-shake").dequeue();
      });
    } 
    return error;
  };

  function stripeResponseHandler(status, response) {
    var $form = $('#payment-form');
    if (response.error) {

      $form.find('.payment-errors').html("<i class='fa fa-exclamation-triangle'></i> " + response.error.message);
      $form.find('button').prop('disabled', false);
    } else {
      var token = response.id;
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));
      $form.get(0).submit();
    }
  };

  $('[data-toggle="tooltip"]').tooltip();

  $('.btn-buy').on('click', function (e) {
    e.preventDefault();

    $('#pay').modal({
      show: true,
      keyboard: false,
      backdrop: false

    });
    var productName =  $(this).data('pname');
    $('#pay').find('.pname').html(productName);
    $('input[name="product_name"]').val(productName);
    dataLayer.push({
      'event':'VirtualPageview',
      'virtualPageURL':'/tripwire/address',
      'virtualPageTitle' : 'TripWire Address'
    });
    dataLayer.push({'event': 'buyButtonClicked', 'eventLabel': $(this)[0].id});
  });

  
  backButton.on("click", function(e) {
    oneTwo("backward");
  });


  $('.btn-info').on('click', function(e) {
    e.preventDefault();
    
    if (invalidForm()) return;


    updateValues();   
    oneTwo("forward");
    dataLayer.push({
      'event':'VirtualPageview',
      'virtualPageURL':'/wireframe/paymentinfo',
      'virtualPageTitle' : 'Payment Info'
    });
    return false
  });

  $('.cc-num').on('input keyup', function(e) {
    var v = $(this).val();
    var cartype = $.payment.cardType(v);
    var valid = false;
    switch (cartype) {
      case "visa":
        $('.card')[0].className = "card visa";
        break;   
      case "mastercard":
        $('.card')[0].className = "card master";
        break; 
      case "discover":
        $('.card')[0].className = "card discovery";
        break;      
      case "amex":
        $('.card')[0].className = "card amex";
        break;
    }
  });

  $('#payment-form').submit(function(e) {
    e.preventDefault();

    var cardNum = $('input.cc-num').val(); 
    var cardExpireDate = $('input.cc-exp').payment('cardExpiryVal'); 
    var cardCVC = $('input.cc-cvc').val();
    if (invalidForm(cardNum, cardExpireDate, cardCVC)) return false;

    var toke = {
      number: cardNum,
      exp_month: cardExpireDate['month'],
      exp_year: cardExpireDate['year'],
      cvc: cardCVC
    }

    // Disable the submit button to prevent repeated clicks
    $(this).find('button').prop('disabled', true);
    Stripe.card.createToken(toke, stripeResponseHandler);

    // Prevent the form from submitting with the default action

    return false;
  });

  // Appointment time 
  // $('#calendar .open').on('click', function(e) {
  //   var selected = $('input[name="dt"]');
  //     $('#calendar').tooltip('hide');
  //   if (selected.val() != '') {
  //     $('#calendar .yourspot').find('span').html('Opened');
  //     $('#calendar .yourspot').removeClass('yourspot').addClass('open')
  //   }

  //   $(this).removeClass('open').addClass('yourspot');
  //   $(this).find('span').html('Reserved');
  //   selected.val($(this).find('span').attr('data-day') + " " + $(this).find('span').attr('data-time'));
  // });
});