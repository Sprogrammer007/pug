$(document).ready(function() {
    var commentEditor;
    
    //Comment Editor
    if ($('#CommentEditor').length != 0) {
      commentEditor = CKEDITOR.replace( 'CommentEditor', {
        toolbar: [{ name: 'basic', items: ['Bold', 'Italic', 'Link', 'NumberedList', 'BulletedList','Indent', 'Outdent'] }],
        skin: 'BootstrapCK4,/CKSkins/bootstrapck/',
        resize_enabled: false,
        height: 150,
        removePlugins : 'elementspath'  
      });

      commentEditor.on('change', function( evt ) {
        $("textarea[name='comments[content]']").val(evt.editor.getData());
      });
    }

    function commentPop(status) {
      $('#comment-pop').modal(status);
    }

    function resetCommentForm() {
      $('.reply-placeholder').html('');
      $("input[name='comments[comment_parent]']").remove();
      $('#comment-form').find('input[name="comments[comment_type]"]').val('Master');
      $('#comment-pop').find('.reply-title').text("Tell us what you think...")
    }

    $('#comment-pop').on('hide.bs.modal', function (e) {
      resetCommentForm();
      return;
    });

    $('.comment-reply').on('click', function(e){
      var comment = $(this).parents('.comment-wrapper');
      var form = $('#comment-form');
      var author = comment.find('.comment-author').html();
      var clone = comment.clone();
      clone.find('footer').remove();
      replyID = comment.attr('id').replace('comment-', '');
      $('#comment-pop').find('.reply-title').text("You're replying " + author + "...")
      form.prepend("<input type='hidden' name='comments[comment_parent]' value=" + replyID + ">");
      form.find('input[name="comments[comment_type]"]').val('Reply')
      $('.reply-placeholder').append(clone);
      commentPop('show');
    });
    // Regular Comment
    $('.btn-comment').on('click', function(e){ 
      commentPop('show');
    });

    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    $('#comment-form').on('submit', function(e) {
      var that = $(this);
      e.preventDefault();
      var error = false;

      $(this).find('.require-field').each(function(){
        if($.trim($(this).val()) == '') {
          error = true;
          $(this).tooltip('show');
        } else if($(this).hasClass('email')) {
          if(!emailReg.test($.trim($(this).val()))) {
            error = true;
            $(this).tooltip('show');
          }
        } else if($(this).hasClass('phone')) {
          if(!phoneReg.test($.trim($(this).val()))) {
            error = true;
            $(this).tooltip('show');
          }
        }
      });
      if(error) return false;
      var data = $(this).serialize();
      console.log(data)
      $.post(window.location.origin + $(this).attr('action'), data, function(data){
        if( data.success === '1' ){
          that.parents('.modal-body').html("<span style='font-size: 18px;'> Your comment is awaiting moderation.</span>")
          $('.btn-comment').remove();
          setTimeout(function() {
            commentPop('hide');
          }, 2000);
        }else{
          $('.error').show();
        }
      }, 'json');
      return false;
    
    });     


});