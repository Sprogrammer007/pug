
$(document).ready(function() {

  $(document).on('click', '.answer-type', function(e) {
    var previous = $(this).siblings('.selected');    
    previous.removeClass('selected');    
    $(this).addClass('selected');    
  });

  $(document).on('keypress', '#sf', function (e) {
    var key = e.which;
    var input = $('#sf');
    if(key == 13 && input.is(':focus') && input.val() != '') {
      $('.a-list').append(answerBlock(input.val()));
      input.val('');
    }
  }).on('click', '#sf', function (e) {
    var input = $('#sf');
    if(input.val() != '') {
      $('.a-list').append(answerBlock(input.val()));
      input.val('');
    }
  });   

  function answerBlock(answer) {
    return "<div class='answer'>" + answer + "<button type='button' class='close'>&times;</button></div>"
  }
});