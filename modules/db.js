// var Client = require('pg-native');
// var bcrypt = require('bcrypt-nodejs');

// var conString = process.env.DATABASE_URL || 'postgres://steve007:@localhost/dev_clash';

// var client = new Client();

// var queries = {
//   createAdmin: "INSERT INTO users (username, email, password, role, status) \
//   VALUES ('Steve007', 'stevey@bigtalkconsulting.com', '" + bcrypt.hashSync('nning007') + 
//   "', 'Admin', 'Confirmed');",

//   createTables: "CREATE TABLE IF NOT EXISTS users \
//   ( \
//     ID              SERIAL PRIMARY KEY NOT NULL, \
//     EMAIL           VARCHAR(100) NOT NULL CONSTRAINT email_already_used UNIQUE, \
//     USERNAME        VARCHAR(60) NOT NULL CONSTRAINT username_already_used UNIQUE, \
//     PASSWORD        VARCHAR(64), \
//     FACEBOOK_ID     VARCHAR(255), \
//     GOOGLE_ID       VARCHAR(255), \
//     ACCOUNT_TYPE    VARCHAR(25) DEFAULT 'Local', \
//     IP              VARCHAR(64), \
//     ROLE            VARCHAR(64), \
//     ACTIVATION_KEY  VARCHAR(60), \
//     INVITED_BY      BIGINT, \
//     EMAIL_CONFIRMED BOOL DEFAULT FALSE, \
//     PROFILE         JSON DEFAULT '{}', \
//     STATUS          VARCHAR(20), \
//     FAILED_ATTEMPTS INT, \
//     TEMP_PASS_TOKEN VARCHAR(32), \
//     RESET_DATE      TIMESTAMP, \
//     LAST_ACTIVE     TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
//     LOCKED_DATE     TIMESTAMP, \
//     REGISTER_DATE   TIMESTAMP DEFAULT CURRENT_TIMESTAMP \
//   ); \
//   CREATE TABLE IF NOT EXISTS posts \
//   ( \
//     ID             SERIAL PRIMARY KEY NOT NULL, \
//     USER_ID        BIGINT, \
//     AUTHOR         VARCHAR(100), \
//     CONTENT        TEXT, \
//     EXCERPT        TEXT, \
//     POST_TYPE      VARCHAR(20), \
//     COMMENT_STATUS VARCHAR(20), \
//     POST_MIME_TYPE VARCHAR(100), \
//     POST_PASSWORD  VARCHAR(20), \
//     TITLE          TEXT, \
//     URL            VARCHAR(255), \
//     DISPLAY_IMAGE  VARCHAR(255), \
//     OPTIONS        JSON, \
//     STATUS         VARCHAR(20), \
//     POSTED_DATE    TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
//     MODIFIED_DATE  TIMESTAMP \
//   ); \
//   CREATE TABLE IF NOT EXISTS post_categories \
//   ( \
//     ID             SERIAL PRIMARY KEY NOT NULL, \
//     CATEGORY       VARCHAR(60) \
//   ); \
//   CREATE TABLE IF NOT EXISTS post_category_relationships \
//   ( \
//     POST_ID        INT REFERENCES posts (id) ON UPDATE CASCADE ON DELETE CASCADE, \
//     CATEGORY_ID    INT REFERENCES post_categories (id) ON UPDATE CASCADE \
//   ); \
//   CREATE TABLE IF NOT EXISTS surveys \
//   ( \
//     ID             SERIAL PRIMARY KEY NOT NULL, \
//     USER_ID        BIGINT, \
//     NAME           VARCHAR(255), \
//     TOKEN          VARCHAR(60), \
//     DESCRIPTION    TEXT, \
//     LOGO_URL       VARCHAR(255), \
//     THANK_MSG      TEXT, \
//     THANK_URL      VARCHAR(255), \
//     IMPRESSIONS    BIGINT DEFAULT 0, \
//     RESPONSE       BIGINT DEFAULT 0, \
//     MAX_RESPONSES  BIGINT DEFAULT 0, \
//     PAGE_COUNT     INT DEFAULT 0, \
//     QUESTION_COUNT INT DEFAULT 0, \
//     OBJECTIVE      VARCHAR(255), \
//     SCHEDULE       VARCHAR(25), \
//     TYPE           VARCHAR(20), \
//     STATUS         VARCHAR(60), \
//     PUBLISHED      BOOL, \
//     UPDATED_AFTER_PUBLISHED  BOOL, \
//     CREATED_DATE   TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
//     START_DATE     TIMESTAMP, \
//     END_DATE       TIMESTAMP \
//   ); \
//   CREATE TABLE IF NOT EXISTS survey_pages \
//   ( \
//     ID              SERIAL PRIMARY KEY NOT NULL, \
//     SURVEY_ID       BIGINT\
//   ); \
//   CREATE TABLE IF NOT EXISTS survey_questions \
//   ( \
//     ID              SERIAL PRIMARY KEY NOT NULL, \
//     SURVEY_ID       BIGINT, \
//     SURVEY_PAGE_ID  BIGINT, \
//     QUESTION        TEXT, \
//     HINT            TEXT, \
//     CHOICES         JSON, \
//     REQUIRED        BOOL, \
//     ALLOW_OTHER     BOOL, \
//     LOGIC           VARCHAR(255), \
//     POSITION        INT, \
//     TYPE            VARCHAR(60), \
//     PARENT_QUESTION BIGINT, \
//     CREATED_DATE   TIMESTAMP DEFAULT CURRENT_TIMESTAMP\
//   ); \
//   CREATE TABLE IF NOT EXISTS survey_responses \
//   ( \
//     ID              SERIAL PRIMARY KEY NOT NULL, \
//     SURVEY_ID       BIGINT, \
//     USER_ID         BIGINT, \
//     ANSWERS         JSON, \
//     RESPONSE_IP     VARCHAR(50), \
//     RESPONSE_DATE   TIMESTAMP DEFAULT CURRENT_TIMESTAMP\
//   ); \
//   CREATE TABLE IF NOT EXISTS services \
//   ( \
//     ID              SERIAL PRIMARY KEY NOT NULL, \
//     USER_ID         BIGINT, \
//     TYPE            VARCHAR(100), \
//     OPTIONS         JSON, \
//     INVITE_CODE     VARCHAR(25), \
//     FIRST_TIME      BOOL DEFAULT TRUE, \
//     USED_INVITE     BOOL DEFAULT FALSE \
//   ); \
//   CREATE TABLE IF NOT EXISTS billings \
//   ( \
//     ID              SERIAL PRIMARY KEY NOT NULL, \
//     USER_ID         BIGINT, \
//     CUSTOMER_ID     VARCHAR(255),\
//     PRIMARY_CARD_ID VARCHAR(255),\
//     CARD_ZIP        VARCHAR(10),\
//     TOTAL_SPENDING  DECIMAL DEFAULT 0\
//   ); \
//   CREATE TABLE IF NOT EXISTS transactions \
//   ( \
//     ID             SERIAL PRIMARY KEY NOT NULL, \
//     USER_ID        BIGINT,  \
//     CUSTOMER_ID    VARCHAR(255), \
//     CARD_ID        VARCHAR(255), \
//     CHARGE_ID      VARCHAR(255), \
//     INVOICE_ID     VARCHAR(255), \
//     PAYMENT_TYPE   VARCHAR(255), \
//     PRODUCT_NAME   VARCHAR(255), \
//     STATUS         VARCHAR(25), \
//     AMOUNT         DECIMAL, \
//     REFUNDED       BOOL, \
//     AMOUNT_REF     DECIMAL, \
//     ERROR_CODE     VARCHAR(255), \
//     ERROR_MSG      TEXT, \
//     ORDERED_DATE   TIMESTAMP DEFAULT CURRENT_TIMESTAMP \
//   );"
// };

// var db = {
//   runQuery: function(query) {
//     client.connect(conString, function(err) {
//       if(err) {
//         return console.error('could not connect to postgres', err);
//       }
//       client.query(query, function(err, result) {
//         if(err) {
//           return console.error('error running query', err);
//         }
//         console.log(result);
//         client.end();
//       });
//     });
//   },
//   Migrate: function(type) {
//     this.runQuery(queries[type]);
//   }
// }

// module.exports = db;