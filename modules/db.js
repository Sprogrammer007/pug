var Client = require('pg-native');
var bcrypt = require('bcrypt-nodejs');

var conString = process.env.DATABASE_URL || 'postgres://steve007:@localhost/dev_clash';

var client = new Client();

var queryV1 = "CREATE TABLE IF NOT EXISTS users \
  ( \
    ID             SERIAL PRIMARY KEY NOT NULL, \
    NAME           VARCHAR(100), \
    EMAIL          VARCHAR(100) NOT NULL, \
    USERNAME       VARCHAR(60) NOT NULL, \
    PASSWORD       VARCHAR(64) NOT NULL, \
    IP             VARCHAR(64), \
    ROLE           VARCHAR(64), \
    DISPLAY_NAME   VARCHAR(250), \
    ACTIVATION_KEY VARCHAR(60), \
    STATUS         INT, \
    REGISTER_DATE  TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
    UNIQUE (EMAIL, USERNAME) \
  ); \
  CREATE TABLE IF NOT EXISTS orders \
  ( \
    ID             SERIAL PRIMARY KEY NOT NULL, \
    USER_ID        BIGINT,  \
    ADDRESS        VARCHAR(255),  \
    CITY           VARCHAR(60),  \
    POSTAL         VARCHAR(20),  \
    STRIPE_CID     VARCHAR(255), \
    TOKEN          VARCHAR(100), \
    RECEIPT        VARCHAR(60), \
    PRODUCT_NAME   VARCHAR(255), \
    TOTAL          NUMERIC, \
    STATUS         VARCHAR(60), \
    ORDERED_DATE   TIMESTAMP DEFAULT CURRENT_TIMESTAMP \
  ); \
  CREATE TABLE IF NOT EXISTS posts \
  ( \
    ID             SERIAL PRIMARY KEY NOT NULL, \
    USER_ID        BIGINT, \
    AUTHOR         VARCHAR(100), \
    CONTENT        TEXT, \
    EXCERPT        TEXT, \
    POST_TYPE      VARCHAR(20), \
    COMMENT_COUNT  BIGINT DEFAULT 0, \
    COMMENT_STATUS VARCHAR(20), \
    POST_MIME_TYPE VARCHAR(100), \
    POST_PASSWORD  VARCHAR(20), \
    TITLE          TEXT, \
    URL            VARCHAR(255), \
    DISPLAY_IMAGE  VARCHAR(255), \
    STATUS         VARCHAR(20), \
    POSTED_DATE    TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
    MODIFIED_DATE  TIMESTAMP \
  ); \
  CREATE TABLE IF NOT EXISTS post_options \
  ( \
    ID             SERIAL PRIMARY KEY NOT NULL, \
    POST_ID        BIGINT NOT NULL, \
    OPTION_KEY     VARCHAR(255), \
    OPTION_VALUE   TEXT \
  ); \
  CREATE TABLE IF NOT EXISTS post_categories \
  ( \
    ID             SERIAL PRIMARY KEY NOT NULL, \
    CATEGORY       VARCHAR(60) \
  ); \
  CREATE TABLE IF NOT EXISTS post_category_relationships \
  ( \
    POST_ID        INT REFERENCES posts (id) ON UPDATE CASCADE ON DELETE CASCADE, \
    CATEGORY_ID    INT REFERENCES post_categories (id) ON UPDATE CASCADE \
  ); \
  CREATE TABLE IF NOT EXISTS comments \
  ( \
    ID             SERIAL PRIMARY KEY NOT NULL, \
    POST_ID        BIGINT NOT NULL, \
    USER_ID        BIGINT, \
    AUTHOR_NAME    VARCHAR(100) NOT NULL, \
    AUTHOR_EMAIL   VARCHAR(100) NOT NULL, \
    AUTHOR_URL     VARCHAR(200), \
    AUTHOR_IP      VARCHAR(100), \
    CONTENT        TEXT, \
    KARMA          INT, \
    LIKE_COMMENT   INT, \
    DISLIKE_COMMENT INT, \
    APPROVED       VARCHAR(20), \
    COMMENT_AGENT  VARCHAR(255), \
    COMMENT_TYPE   VARCHAR(20), \
    COMMENT_PARENT BIGINT, \
    COMMENT_DATE   TIMESTAMP DEFAULT CURRENT_TIMESTAMP\
  ); \
  CREATE TABLE IF NOT EXISTS comment_metas \
  ( \
    ID             SERIAL PRIMARY KEY NOT NULL, \
    COMMENT_ID     BIGINT NOT NULL, \
    META_KEY       VARCHAR(255), \
    META_VALUE     TEXT \
  ); \
  INSERT INTO users (username, email, password, display_name, role, status) VALUES ('Steve007', 'stevey@bigtalkconsulting.com', '" + bcrypt.hashSync('nning007') + "', 'Steve', 'Admin', 1); \
";

var migration2 = "CREATE TABLE IF NOT EXISTS surveys \
  ( \
    ID             SERIAL PRIMARY KEY NOT NULL, \
    USER_ID        BIGINT, \
    NAME           VARCHAR(255), \
    TOKEN          VARCHAR(60), \
    DESCRIPTION    TEXT, \
    LOGO_URL       VARCHAR(255), \
    THANK_YOU      TEXT, \
    REWARD_URL     VARCHAR(255), \
    IMPRESSIONS    BIGINT DEFAULT 0, \
    RESPONSE       BIGINT DEFAULT 0, \
    AMOUNT_SPENT   DECIMAL DEFAULT 0, \
    PAGE_COUNT     INT DEFAULT 0, \
    QUESTION_COUNT INT DEFAULT 0, \
    OBJECTIVE      VARCHAR(255), \
    SCHEDULE       VARCHAR(25), \
    TYPE           VARCHAR(20), \
    STATUS         VARCHAR(60), \
    PUBLISHED      BOOL, \
    UPDATED_AFTER_PUBLISHED  BOOL, \
    CREATED_DATE   TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
    START_DATE     TIMESTAMP, \
    END_DATE       TIMESTAMP \
  ); \
  CREATE TABLE IF NOT EXISTS survey_pages \
  ( \
    ID              SERIAL PRIMARY KEY NOT NULL, \
    SURVEY_ID       BIGINT, \
    CREATED_DATE    TIMESTAMP DEFAULT CURRENT_TIMESTAMP\
  ); \
  CREATE TABLE IF NOT EXISTS survey_questions \
  ( \
    ID              SERIAL PRIMARY KEY NOT NULL, \
    SURVEY_ID       BIGINT, \
    SURVEY_PAGE_ID  BIGINT, \
    QUESTION        TEXT, \
    HINT            VARCHAR(255), \
    ANSWERS         JSON, \
    RATING          JSON, \
    MULTI_ANSWERS   BOOL, \
    REQUIRED        BOOL, \
    ALLOW_OTHER     BOOL, \
    LOGIC           VARCHAR(255), \
    POSITION        INT, \
    TYPE            VARCHAR(60), \
    PARENT_QUESTION BIGINT, \
    CREATED_DATE   TIMESTAMP DEFAULT CURRENT_TIMESTAMP\
  ); \
  CREATE TABLE IF NOT EXISTS survey_responses \
  ( \
    ID              SERIAL PRIMARY KEY NOT NULL, \
    SURVEY_ID       BIGINT, \
    USER_ID         BIGINT, \
    ANSWERS         JSON, \
    RESPONSE_IP     VARCHAR(50), \
    RESPONSE_DATE   TIMESTAMP DEFAULT CURRENT_TIMESTAMP\
  ); \
"

var db = {
  init: function() {
    this.runQuery(queryV1);
  },
  runQuery: function(query) {
    client.connect(conString, function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }
      client.query(query, function(err, result) {
        if(err) {
          return console.error('error running query', err);
        }
        console.log(result);
        client.end();
      });
    });
  },
  dbMigrate: function() {
    this.runQuery(migration2);
  }
}

module.exports = db;