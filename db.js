var Client = require('pg-native');

var conString = process.env.DATABASE_URL || 'postgres://steve007:@localhost/dev_clash';

var client = new Client();

var queryString = "CREATE TABLE IF NOT EXISTS users \
  ( \
    ID             SERIAL PRIMARY KEY     NOT NULL, \
    NAME           TEXT,    \
    EMAIL          TEXT    NOT NULL, \
    PHONE          TEXT,    \
    IP             TEXT,    \
    CREATE_DATE    DATE , \
    ADDRESS        CHAR(50), \
    POSTAL         CHAR(50), \
    CITY           CHAR(50) \
  ); \
  CREATE TABLE IF NOT EXISTS orders \
  ( \
    ID             SERIAL PRIMARY KEY     NOT NULL, \
    USER_ID        INT,     \
    STRIPE_CID     TEXT,     \
    TOKEN          TEXT, \
    PRODUCT_NAME   TEXT, \
    MAIL           BOOL, \
    SUBTOTAL       INT, \
    TOTAL          INT, \
    STATUS         TEXT, \
    CREATE_DATE    DATE, \
    APPROVE_DATE   DATE \
  ); \
  CREATE TABLE IF NOT EXISTS order_details \
  ( \
    ID             SERIAL PRIMARY KEY    NOT NULL, \
    ORDER_ID       INT,     \
    COMPANY_NAME   TEXT,     \
    POSITION       TEXT, \
    INDUSTRY       TEXT, \
    YEARS          TEXT, \
    WEBSITE        TEXT, \
    IMPORTANT      TEXT, \
    PURPOSE        TEXT, \
    CUSTOMER       TEXT \
  ); \
  CREATE TABLE IF NOT EXISTS posts \
  ( \
    ID             SERIAL PRIMARY KEY    NOT NULL, \
    ARTHUR         TEXT, \
    CONTENT        TEXT, \
    EXCERPT        TEXT, \
    BOPTIN         TEXT, \
    POPTIN         TEXT, \
    POPON          BOOL, \
    CATEGORY       TEXT, \
    TITLE          TEXT, \
    URL            TEXT, \
    DISPLAY_IMAGE  TEXT, \
    STATUS         BOOL, \
    CREATE_DATE    DATE, \
    UPDATE_DATE    DATE \
  ); \
  ALTER TABLE posts ADD COLUMN OG_IMAGE TEXT; \
";

client.connect(conString, function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query(queryString, function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result);
    client.end();
  });
});