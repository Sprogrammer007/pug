var DBManager = require('../modules/database-manager')
    , db = new DBManager()
    , moment = require('moment')
    , Crypto = require('crypto')
    , Serializer = require('node-serialize')
    , _ = require('underscore');


function Base() {
};

Base.convertObject = function(o, db) {
  for (var key in db) {
    if (db.hasOwnProperty(key)) {
      o[key] = db[key];
    }
  }
  return o;
};

Base.generateToken = function(bytes) {
  try {
    var buf = Crypto.randomBytes(bytes);
    console.log(buf.toString())
    return buf.toString('hex');
  } catch (ex) {
    console.log("Token Errors")
    console.log(ex)
  }
};


module.exports = Base;