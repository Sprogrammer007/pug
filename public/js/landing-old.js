  var tip6Showned = false;
  var modalOpen = false;
  // table of content scrolling
  $('.wrapper').TrackpadScrollEmulator();

  // Toogle table of content
  $('.table-toggle').on('click', function() {
    $('body').toggleClass('expand')
  });

  // hide footer
  $('footer .close').on('click', function() {
    $('footer').css("bottom","-470px");
  });

  var downloadList = $('.downloads-socials');
  var tip19 = $('#19').position();
  var tip6 = $('#6').position();
  var downloadListPos = downloadList.position();

  // $(window).on('scroll', function() {
  //   if ( $(window).scrollTop() > downloadListPos.top - 10) {
  //     downloadList.css('position', 'fixed').css('top', '30px');
  //   } else {
  //     downloadList.css('position', '').css('top', '');
  //   };

  //   if ( $(window).scrollTop() > tip6.top  && !modalOpen && !tip6Showned) {
  //     $('#wireframe').modal({
  //       show: true,
  //       keyboard: false,
  //       backdrop: false
  //     });

  //     tip6Showned = true;
  //     modalOpen = true;
  //   }

  //   if ( $(window).scrollTop() > tip19.top ) {
  //     $('footer').find('.close').hide()
  //     $('footer').css('position', 'relative').css('bottom', '-80px');
  //   }
  // });

  // $('#wireframe').on('hidden.bs.modla', function() {
  //   modalOpen = false;
  // });

  /* center modal */
  function centerModals(){
    $('.modal').each(function(i){
      var $clone = $(this).clone().css('display', 'block').appendTo('body');
      var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
      top = top > 0 ? top : 0;
      $clone.remove();
      $(this).find('.modal-content').css("margin-top", top);
    });
  }
  $('.modal').on('show.bs.modal', centerModals);
  $(window).on('resize', centerModals);

  // Function helpers

  function setCookie(name, value) {
    var now = new Date();
    var expireDate= new Date();
    expireDate.setTime(now.getTime() + 20*365*24*60*60*1000); 
    var curCookie = name + "=" + escape(value) + ";path=/;domain=.goodui.org;expires=" + expireDate; 
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


  function isScrolledIntoView(elem)
  {
      var docViewTop = $(window).scrollTop();
      var docViewBottom = docViewTop + $(window).height();

      var elemTop = $(elem).offset().top;
      var elemBottom = elemTop + $(elem).height();

      return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
  }
