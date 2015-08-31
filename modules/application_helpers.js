

var helper = {
  titleHelper: function(title) {
    return title + ' | Designed For Result';
  },
  is_mobile: function(req) {
    var ua = req.header('user-agent');
    if( ua.match(/Android/i)
     || ua.match(/webOS/i)
     || ua.match(/iPhone/i)
     || ua.match(/iPad/i)
     || ua.match(/iPod/i)
     || ua.match(/BlackBerry/i)
     || ua.match(/Windows Phone/i)
     || ua.match(/Mobile/i)
     || ua.match(/Kindle/i)
     || ua.match(/Opera Mobi/i)
     ){
      return true;
    } else {
      return false;
    }
  }
};




module.exports = helper;