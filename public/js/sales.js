$(document).ready(function() {

  var stepOne = $(".step-one");
  var stepTwo = $(".step-two");
  var stepThree = $(".step-three");
  var activeStep = stepOne;
  var values = {};
  var closeButton = $('.close')
  var backButton = $('.back')
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  var phoneReg = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

  wow = new WOW({
    boxClass:     'wow',      // default
    animateClass: 'animated', // default
    offset:       0,          // default
    mobile:       true,       // default
    live:         true        // default
  });
  wow.init();


  $('input.cc-num').payment('formatCardNumber');
  $('input.cc-exp').payment('formatCardExpiry');
  $('input.cc-cvc').payment('formatCardCVC');

  var oneTwo = function(direction) {
    if (direction === "forward") {
      activeStep.hide("slide", { direction: "left" }, 1200);
      $('.modal-dialog').delay(400).animate({ width: 350  }, 1200 );
      $('.modal-body').delay(400).animate({ height: 280  }, 1200 );
      stepTwo.delay(400).fadeIn(1200);
      closeButton.hide();
      backButton.show();
      activeStep = stepTwo; 
    };

    if (direction === "backward") {
      activeStep.hide("slide", { direction: "left" }, 1200);
      $('.modal-dialog').delay(400).animate({ width: 600  }, 1200 );
      $('.modal-body').delay(400).animate({ height: 306  }, 1200 );
      stepOne.delay(800).fadeIn(1200);
      closeButton.show();
      backButton.hide();
      activeStep = stepOne; 
    }
  };

  var twoThree = function(direction) {
    if (direction === "forward") {
      activeStep.hide("slide", { direction: "left" }, 1200);
      stepThree.delay(400).show("slide", { direction: "right" }, 1200);
      $('.modal-body').delay(400).animate({ height: 180  }, 1200 );
      activeStep = stepThree; 
    };  
    if (direction === "backward") {
      activeStep.hide("slide", { direction: "right" }, 1200);
      stepTwo.delay(400).show("slide", { direction: "left" }, 1200);
      $('.modal-body').delay(400).animate({ height: 280  }, 1200 );
      activeStep = stepTwo; 
    };
  }

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

    if (activeStep === stepThree) {
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
    console.log(response)
    if (response.error) {
      // Show the errors on the form
      $form.find('.payment-errors').text(response.error.message);
      $form.find('button').prop('disabled', false);
    } else {
      // response contains id and card, which contains additional card details
      var token = response.id;
      // Insert the token into the form so it gets submitted to the server
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));
      // and submit
      $form.get(0).submit();
    }
  };

  $('.btn-buy').on('click', function (e) {
    e.preventDefault();
    $('#pay').modal({
      show: true,
      keyboard: false,
      backdrop: false

    });
    var productName =  $(this).data('pname');
    var price =  $(this).data('price');
    $('#pay').find('.pname').html(productName);
    $('input[name="product_name"]').val(productName);
    $('input[name="sub_total"]').val(price);
    dataLayer.push({
    'event':'VirtualPageview',
    'virtualPageURL':'/wireframe/upsell',
    'virtualPageTitle' : 'Mail'
    });
    dataLayer.push({'event': 'buyButtonClicked', 'eventLabel': $(this)[0].id});
  });



  $('#demos').on('show.bs.modal', function (e) {
    var trigger = $(e.relatedTarget); // Button that triggered the modal
    var imagePath = trigger.find('.hexagon').css('background-image').replace('url(','').replace(')','');
   
    $(this).find('.image-wrapper').html("<img src='" + imagePath + "'/>")
  });
  
  backButton.on("click", function(e) {
    if (activeStep === stepTwo) {
      oneTwo("backward");
    } else {
      twoThree("backward");
    };
  });

  $('input[name="shipping"]').on("click", function(e) {
    oneTwo("forward");
    dataLayer.push({
      'event':'VirtualPageview',
      'virtualPageURL':'/wireframe/userinfo',
      'virtualPageTitle' : 'User Info'
    });
  });

  $('.btn-info').on('click', function(e) {
    e.preventDefault();
    
    if (invalidForm()) return;


    updateValues();   
    twoThree("forward");
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
});