var Client = require('pg-native');

var conString = process.env.DATABASE_URL || 'postgres://steve007:@localhost/dev_clash';

var client = new Client();

var queryV1 = "CREATE TABLE IF NOT EXISTS users \
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
    RECEIPT        TEXT, \
    PRODUCT_NAME   TEXT, \
    TOTAL          INT, \
    STATUS         TEXT, \
    CREATE_DATE    DATE \
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
";

var queryV2 = "ALTER TABLE posts ADD COLUMN OG_IMAGE TEXT;"
var queryV2 = "ALTER TABLE posts ADD COLUMN OG_IMAGE TEXT; \
"

var db = {
  init: function() {

    client.connect(conString, function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }
      client.query(queryV1, function(err, result) {
        if(err) {
          return console.error('error running query', err);
        }
        console.log(result);
        client.end();
      });
    });


  }
}

module.exports = db;