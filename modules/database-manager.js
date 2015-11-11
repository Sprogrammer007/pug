var pg = require('pg')
  , Serializer = require('node-serialize')
  , moment = require('moment')
  , _ = require('underscore');

var conString = process.env.DATABASE_URL || 'postgres://steve007:@localhost/dev_clash';

var query = '';

function DBManager() {
  this.rawQuery = function(query, done) {
    runQuery(query, null, function(err, result) {
      if (_.isFunction(done)) {
        return done(err, result);
      } else {
        return (err ? false : result);
      }
    });
  };

  this.create = function(table, properties, returns, done) {
    var columns = _.allKeys(properties)
      , values = _.values(properties)
      , vHolder = _.map(values, function(v, i) { i++; return ("$" + i); });
    returns = (returns || "*");

    query =  "INSERT INTO " + table + " (" + columns.join(", ") + ") " + "VALUES (" + vHolder.join(", ") + ") RETURNING " + returns + ";";
    runQuery(query, values, function(err, result) {
      return done(err, result);
    });
  };

  this.update = function(table, properties, id, done) {
    var values = _.values(properties)
      , columns = _.map(_.allKeys(properties), function(v, i) {i++; return (v + "=$" + i);});
    query =  "UPDATE " + table + " SET " + columns.join(", ")  + ' WHERE id=' + id + " RETURNING *;"; 
    runQuery(query, values, function(err, result) {
      if (_.isFunction(done)) {
        done(err, result);
      } else {
        return result;
      }
    });
  };

  this.destroy = function(table, p, value, done) {
    query = 'DELETE FROM ' + table + ' WHERE ' + p + '=$1';
    runQuery(query, _.flatten([value]), function(err, result) {
      if (_.isFunction(done)) {
        return done(err, result);
      } else {
        return (err) ? false : true
      }
    });
  };

  this.where = function(table, select, where, values, order, direction, done) {
    query = 'SELECT ' + (select || "*") + ' FROM ' + 
    table + ' WHERE ' + where + ' ORDER BY ' + 
    order + ' ' + direction + ';';

    runQuery(query, values, function(err, result) {
      return done(err, result);
    });
  };

  this.findBy = function(table, select, property, value, done) {

    select = select || "*";
    query = 'SELECT ' + select + ' FROM ' + table + ' WHERE ' + property + '=$1;';
    runQuery(query, _.flatten([value]), function(err, result) {
      return done(err, result);
    });
  };

  this.all = function(table, order, direction, done) {
    query = 'SELECT * FROM ' + table; 
  
    if (order != null) {
      query = query  + ' ORDER BY ' + order + ' ' + direction + ';';
    }
    runQuery(query, null, function(err, result) {
      return done(err, result);
    });
  };


  this.createMulti = function(table, columns, values, id, done) {
    var values =  _.map(values, function(v, k) {
      if (values.hasOwnProperty(k) && values[k] != '') {
        return ('(' + id + ", '"  + v + "')");
      }
    });

    if (values.length === 0) { return( done ? done(false) : false) };
    query =  "INSERT INTO " + table + " (" + columns.join(", ") + ") " + "VALUES " + values.join(", ") + ";";
    runQuery(query, null, function(err, result) {
      if (done) {
        return done((err ? false : true));
      } else {
        return (err ? false : true);
      }
    });
  };

  this.count = function(table, item, conditions, done) {
    var c = _.map(conditions, function(v, k) {
      if (_.isString(v)) {
        return k + "='" + v + "'";
      } else {
        return k + "=" + v;
      }
    });

    query = "SELECT COUNT(" + item + ") FROM " + table + 
    (conditions ? " WHERE " + c.join(" AND ") : " ") + ";";

    runQuery(query, null, function(err, result) {

      return done(err, result[0].count);
    })
  };

  function runQuery(query, values, callback) {
    values = (values != null) ? (_.isArray(values) ? values : [values]) : values;
    console.warn("Running Query: %s", query);
    pg.connect(conString, function(err, client, done) {
      // handle an error from the connection
      if(handleError(err, client, done)){ return callback(err) };

      client.query(query, values, function(err, result) { 
        if(handleError(err, client, done)){ return callback(err) };
        done();
        return callback(false, result.rows);
      });

    });
  };

  function handleError(err, client, done) {
    // no error occurred, continue with the request
    if(!err) return false;

    // An error occurred, remove the client from the connection pool.
    // A truthy value passed to done will remove the connection from the pool
    // instead of simply returning it to be reused.
    // In this case, if we have successfully received a client (truthy)
    // then it will be removed from the pool.
    if(client){
      done(client);
    }
    console.log('An Error has occurred');
    console.log(err);
    return true;
  };
}


module.exports = DBManager;

