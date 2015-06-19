var Client = require('pg-native')
  , moment = require('moment');

var conString = process.env.DATABASE_URL || 'postgres://steve007:@localhost/dev_clash';

var client = new Client();
var query = '';


// Private functions
function dollarToCent(dollar) {
  return (dollar * 100)
}

function createQuery(table, hash) {
  var qHead = "INSERT INTO ";
  var columns = [];
  var vHolder = [];
  var values = [];
  var count = 0;
  for (var h in hash) { 
    
    if (hash.hasOwnProperty(h)) {
      columns.push(h);
      count++
      vHolder.push("$" + count);
      values.push(hash[h]);
    }
  }
  var query =  qHead + table + " (" + columns.join(", ") + ") " + "VALUES (" + vHolder.join(", ") + ")";
  client.connectSync(conString);
  client.querySync(query, values);
  client.end();
}

function updateQuery(table, hash, id) {
  var qHead = "UPDATE ";
  var columns = [];
  var values = [];
  var count = 0;
  var idIndex = Object.keys(hash).length + 1;
  for (var h in hash) { 
    
    if (hash.hasOwnProperty(h)) {
      count++
      columns.push(h + "=$" + count );
      values.push(hash[h]);
    }
  }
  values.push(id)
  var query =  qHead + table + " SET " + columns.join(", ")  + ' WHERE id=$' + idIndex; 
  client.connectSync(conString);
  client.querySync(query, values);
  client.end();
}

var dbManager = {

  createUser: function(req) { 
    req.body['create_date'] = moment().format('YYYY-MM-DD');
    createQuery('users', req.body);

    var user = this.getUserByEmail(req.body.email)
    return user;
  },

  getUserByEmail: function(email) {
    client.connectSync(conString);
    query = 'SELECT * FROM users WHERE email=$1 LIMIT 1';
    var user = client.querySync(query, [email]);
    client.end();
    return user[0];
  },

  updateUser: function(req, id) {
    updateQuery('users', req.body, id)
  },

  createOrder: function(req, user_id, customer_id, token) {
    var params = req.body;
    params['user_id'] = user_id;
    params['stripe_cid'] = customer_id;
    params['token'] = token;
    params['mail'] = false;
    params['subtotal'] = dollarToCent(parseInt(params.subtotal));
    params['status'] = 'Payed';
    params['create_date'] = moment().format('YYYY-MM-DD');
    // dollarToCent((mail === "on") ? (parseInt(params.sub_total) + 5) : parseInt(params.sub_total));
  
    createQuery('orders', params);

    var order = this.getOrderByToken(token);
    
    return order;
  },

  createOrderDetail: function(req, id) {
    client.connectSync(conString);
    var params = req.body;
    var company = params.company_name;
    var position = params.position;
    var industry = params.industry;
    var years = params.year_business;
    var website = params.website;
    var important = params.website_importance;
    var purpose = params.website_for;
    var customer = params.customer;

    query = 'INSERT INTO order_details (order_id, company_name, position, industry, \
      years, website, important, purpose, customer) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
    client.querySync(query, [id, company, position, industry, years, website, important, purpose, customer]);
    client.end();
    var detail = getDetailsByOrderID(id)
  
    return detail;

  },

  getDetailsByOrderID: function(order_id) {
    client.connectSync(conString);
    query = 'SELECT * FROM order_details WHERE order_id=$1 LIMIT 1';
    var details = client.querySync(query, [order_id])
    client.end();
    return details[0];
  },

  getOrderByToken: function(token) {
    console.log(token);
    client.connectSync(conString);
    query = 'SELECT * FROM orders WHERE token=$1 LIMIT 1';
    var order = client.querySync(query, [token])
    client.end();
    return order[0];
  },

  getAllPosts: function() {
    client.connectSync(conString);
    query = 'SELECT * FROM posts ORDER BY CREATE_DATE DESC';
    var posts = client.querySync(query);
    client.end();
    return posts
  },

  getAllLivePosts: function() {
    client.connectSync(conString);
    query = "SELECT * FROM posts WHERE status= 'true' ORDER BY CREATE_DATE DESC"
    var posts = client.querySync(query);
    client.end();
    return posts
  },

  getPostByURL: function(url) {
    client.connectSync(conString);
    query = 'SELECT * FROM posts WHERE url=$1 LIMIT 1';
    var post = client.querySync(query, [url])
    client.end();
    return post[0];
  },

  createPost: function(r) {
    r.body.url = r.body.title.trim().replace(/\s+/g, '-').replace(',', '').toLowerCase();
    r.body.create_date = moment().format('YYYY-MM-DD');
    createQuery("posts", r.body);
    return
  },  

  updatePost: function(r) {
    updateQuery('posts', r.body, r.params.id);
    return
  },

  deletePost: function(id) {
    client.connectSync(conString);
    query = 'DELETE FROM posts WHERE id=$1'
    client.querySync(query, [id]);
    client.end();
    return
  },

  findPostByID: function(id) {
    client.connectSync(conString);
    query = 'SELECT * FROM posts WHERE id=$1 LIMIT 1';
    var post = client.querySync(query, [id])[0];
    client.end();
    return post;
  }
}



module.exports = dbManager;

