var pg = require('pg')
  , Serializer = require('node-serialize')
  , moment = require('moment')
  , _ = require('underscore');

var conString = process.env.DATABASE_URL || 'postgres://steve007:@localhost/dev_clash';

var query = '';

function DBManager() {
  this.rawQuery = function(query, callback) {
    runQuery(query, null, function(err, result) {
      if (callback) {
        return callback((err ? false : result));
      } else {
        return (err ? false : result);
      }
    });
  };

  this.create = function(table, properties, returns, callback) {
    var columns = _.allKeys(properties)
      , values = _.values(properties)
      , vHolder = _.map(values, function(v, i) { i++; return ("$" + i); });
    returns = (returns || "*");

    query =  "INSERT INTO " + table + " (" + columns.join(", ") + ") " + "VALUES (" + vHolder.join(", ") + ") RETURNING " + returns + ";";
    runQuery(query, values, function(err, result) {
      return callback((err ? false : result[0]));
    });
  };

  this.update = function(table, properties, id, callback) {
    var values = _.values(properties)
      , columns = _.map(_.allKeys(properties), function(v, i) {i++; return (v + "=$" + i);});

    query =  "UPDATE " + table + " SET " + columns.join(", ")  + ' WHERE id=' + id + " RETURNING *;"; 
    runQuery(query, values, function(err, result) {
      if (_.isFunction(callback)) {
        callback(result);
      } else {
        return result;
      }
    });
  };

  this.destroy = function(table, p, value, callback) {
    query = 'DELETE FROM ' + table + ' WHERE ' + p + '=$1'
    runQuery(query, _.flatten([value]), function(err, result) {
      if (callback) {
        return callback((err ? false : true));
      } else {
        return (err ? false : true);
      }
    });
  };

  this.where = function(table, property, values, order, direction, callback) {
    var whereQuery = _.isString(property) ? property : (property + '=$1')
    query = 'SELECT * FROM ' + table + ' WHERE ' + whereQuery + ' ORDER BY ' + order + ' ' + direction + ';';

    runQuery(query, values, function(err, results) {
      return callback((err ?  false : results));
    });
  };

  this.findBy = function(table, select, property, value, callback) {
    select = select || "*";
    query = 'SELECT ' + select + ' FROM ' + table + ' WHERE ' + property + '=$1;';
    runQuery(query, _.flatten([value]), function(err, result) {
      return callback(err ? false : result);
    });
  };

  this.all = function(table, order, direction, callback) {
    query = 'SELECT * FROM ' + table; 
  
    if (order != null) {
      query = query  + ' ORDER BY ' + order + ' ' + direction + ';';
    }
    runQuery(query, null, function(err, result) {
      return callback((err ? false : result));
    });
  };

  this.manyToMany = function(table, properties, values, id, callback) {
    var values = _.map(_.flatten([values]), function(e) {return ('(' + id + ', ' + e + ')');});

    query = "INSERT INTO " + table + " (" + properties.join(", ") + ") " + "VALUES " + values.join(", ") + ";";

    runQuery(query, null, function(err, result) {
      if (callback) {
        return callback((err ? false : true));
      } else {
        return (err ? false : true);
      }
    });
  };

  this.createMulti = function(table, columns, values, id, callback) {
    var values =  _.map(values, function(v, k) {
      if (values.hasOwnProperty(k) && values[k] != '') {
         v = (values[k].constructor == Object) ? Serializer.serialize(values[k]) : values[k];
         return ('(' + id + ", '" + k + "', '" + v + "')");
      }
    });

    if (values.length === 0) { return(callback? callback(false) : false) };
    query =  "INSERT INTO " + table + " (" + columns.join(", ") + ") " + "VALUES " + values.join(", ") + ";";
    runQuery(query, null, function(err, result) {
      if (callback) {
        return callback((err ? false : true));
      } else {
        return (err ? false : true);
      }
    });
  };

  this.count = function(table, item, conditions, callback) {
    var c = _.map(conditions, function(v, k) {
      if (_.isString(v)) {
        return k + "='" + v + "'";
      } else {
        return k + "=" + v;
      }
    });

    query = "SELECT COUNT(" + item + ") FROM " + table + " WHERE " + c.join(" AND ") + ";";

    runQuery(query, null, function(err, result) {

      return callback((err ? false : result[0].count));
    })
  };

  function runQuery(query, values, callback) {
    values = (values != null) ? (_.isArray(values) ? values : [values]) : values;
    console.log(Object.keys(pg.pools.all));
    console.log("Query being run is [%s]", query);
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

