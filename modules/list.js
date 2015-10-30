var moment = require('moment')
  , MCID = process.env.MC_ID
  , _ = require('underscore')
  , mcapi = require('../node_modules/mailchimp-api/mailchimp')
  , MCKEY = process.env.MC_KEY || "8b8bff773968e11ac3881a74bb8bef66-us10"
  , mc = new mcapi.Mailchimp(MCKEY)
  , _ = require('underscore');

var options = {
  id: '663713882d',
  email_type: 'html',
  double_optin: false,
  update_existing: true,
  replace_interests: true,
  send_welcome: false
};

function List () {
}

List.subscribe = function(email, username, done) {
  options.email = {email: email};
  options.merge_vars = {EMAIL: email, UNAME: username, REGISTER: ((username) ? 'Yes' : 'No')  };
  mc.lists.subscribe(options, function(data) {
    console.log('User subscribed successfully! Look for the confirmation email.');
    return (done ? done(false, true) : true);
  },
  function(error) {
    if (error.error) {
      console.log(error.code + ": " + error.error);
      return (done ? done(true, false) : false);
    }
  });
};


List.batchSubscribe = function(emails, token, done) {
  options.id = 'e902dd6ab1';
  options.batch = _.map(emails, function(email) {
    return {
      email: {email: email},
      merge_vars: {email: email, code: token}
    }
  });

  mc.lists.batchSubscribe(options, function(data) {
    console.log(data)
    return (done ? done(false, true) : true);
  },
  function(error) {
    if (error.error) {
      console.log(error.code + ": " + error.error);
      return (done ? done(true, false) : false);
    }
  });
}
module.exports = List;