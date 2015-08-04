var Client = require('pg-native')
  , Serializer = require('node-serialize')
  , moment = require('moment')
  , _ = require('underscore');

var conString = process.env.DATABASE_URL || 'postgres://steve007:@localhost/dev_clash';

var client = new Client();
var query = '';



function createQuery(table, v, r) {
  var qHead = "INSERT INTO ";
  var columns = [];
  var vHolder = [];
  var values = [];
  var returns = (r || "*")
  var count = 0;
  for (var h in v) { 
    if (v.hasOwnProperty(h)) {
      columns.push(h);
      count++
      vHolder.push("$" + count);
      values.push(v[h]);
    }
  }

  query =  qHead + table + " (" + columns.join(", ") + ") " + "VALUES (" + vHolder.join(", ") + ") RETURNING " + returns + ";";
  client.connectSync(conString);

  var result = client.querySync(query, values);
  client.end();

  return result[0]
}

function createMultiQuery(t, p, v, id) {

  var qHead = "INSERT INTO ";
  var values = [];
  for (var h in v) {  
    if (v.hasOwnProperty(h) && v[h] != '') {
      if (v[h].constructor == Object){
        v[h] = Serializer.serialize(v[h]);
      }
      values.push('(' + id + ", '" + h + "', '" + v[h] + "')");
    }
  }
  if (values.length === 0) { return };
  query =  qHead + t + " (" + p.join(", ") + ") " + "VALUES " + values.join(", ") + ";";
  client.connectSync(conString);
  client.querySync(query);
  client.end();
}

function createRelationQuery(t, p, v, id) {
  var qHead = "INSERT INTO ";
  var values = [];
  // Fix single category issue of not being an array.
  v = [].concat.apply([], [v]);

  v.forEach(function(e, i, a) {
    values.push('(' + id + ', ' + e + ')');
  });

  query =  qHead + t + " (" + p.join(", ") + ") " + "VALUES " + values.join(", ") + ";";
  client.connectSync(conString);
  client.querySync(query);
  client.end();
}

function updateQuery(table, properties, id) {

  var qHead = "UPDATE ";
  var columns = [];
  var values = [];
  var count = 0;
  for (var h in properties) { 
    
    if (properties.hasOwnProperty(h)) {
      count++
      columns.push(h + "=$" + count );
      values.push(properties[h]);
    }
  }
  query =  qHead + table + " SET " + columns.join(", ")  + ' WHERE id=' + id + " RETURNING *;"; 
  client.connectSync(conString);
  var result = client.querySync(query, values);
  client.end();
};


function countQuery(table, item, conditions) {
  c = _.map(conditions, function(v, k) {
    if (_.isString(v)) {
      return k + "='" + v + "'";
    } else {
      return k + "=" + v;
    }
  });

  client.connectSync(conString);
  query = "SELECT COUNT(" + item + ") FROM " + table + " WHERE " + c.join(" AND ") + ";";
  var result = client.querySync(query);

  client.end();
  return result[0].count;
};


var dbManager = {
  
  rawQuery: function(q) {
    client.connectSync(conString);
    var results = client.querySync(q);
    client.end();
    return results
  },


  all: function(table, order, direction) {
    query = query = 'SELECT * FROM ' + table; 
    client.connectSync(conString);

    if (order != null) {
      query = query  + ' ORDER BY ' + order + ' ' + direction + ';';
    }
    var results = client.querySync(query);
    client.end();
    return results
  },

  create: function(table, properties, returns) {
    return createQuery(table, properties, returns);
  },

  createMultiple: function(table, properties, values, id) {
    createMultiQuery(table, properties, values, id);
  },  

  createRelation: function(table, properties, values, id) {
    createRelationQuery(table, properties, values, id);
  },

  findBy: function(table, property, value, done) {
    client.connectSync(conString);
    query = 'SELECT * FROM ' + table + ' WHERE ' + property + '=$1 LIMIT 1;';
    var result = client.querySync(query, [value]);
    client.end();

    if (!result) {
      return done(null, null);
    } else {
      return done(null, result);
    }
  },

  findAllBy: function(table, select, property, value) {
    client.connectSync(conString);
    select = select || "*";
    query = 'SELECT ' + (select || "*") + ' FROM ' + table + ' WHERE ' + property + '=$1;';
    var result = client.querySync(query, [value]);
    return result;
  },

  update: function(table, values, id) {
    updateQuery(table, values, id);
  },

  count: function(table, item, conditions) {
    return countQuery(table, item, conditions);
  },

  destroy: function(table, p, v) {
    client.connectSync(conString);
    query = 'DELETE FROM ' + table + ' WHERE ' + p + '=$1'
    client.querySync(query, [v]);
    client.end();
  },

}



module.exports = dbManager;

