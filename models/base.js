var DBManager = require('../modules/database-manager')
    , db = new DBManager()
    , moment = require('moment')
    , Serializer = require('node-serialize')
    , _ = require('underscore');


function Base() {

};

Base.prototype.toJson = function(options, serialize) {
  serialize = serialize || false;
  var that = _.omit(this, function(v, k, o) {
    if (_.isArray(v)) {
      v = _.map(v, function(e){
        if(_.isObject(e) && _.isFunction(e.toJson)) {
          return e.toJson();
        }
      });
    }

    if (_.isObject(v) && _.isFunction(v.toJson)) { v = v.toJson };
    return (_.isFunction(v) || _.contains(options, k));
  });
  if (serialize) {that = Serializer.serialize(that)};
  return that;
}

Base.convertObject = function(o, db) {
  for (var key in db) {
    if (db.hasOwnProperty(key)) {
      o[key] = db[key];
    }
  }
  return o;
};


module.exports = Base;