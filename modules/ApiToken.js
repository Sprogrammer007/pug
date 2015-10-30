var moment = require('moment')
  , Crypto = require('crypto')
  , _ = require('underscore')
  , currentToken = undefined;

function ApiToken () {
}

ApiToken.generate = function() {
  currentToken =  currentToken || generateToken(32);
  return currentToken;
};

ApiToken.verify = function(token) {
  return token === currentToken;
}

function generateToken(bytes) {
  try {
    var buf = Crypto.randomBytes(bytes);
    return buf.toString('hex');
  } catch (ex) {
    console.log("Token Errors")
    console.log(ex)
  }
};


module.exports = ApiToken;