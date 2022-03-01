var config = {};

config.web = {};
config.mongodb = {};

config.mongodb.pem = process.env.MONGODB_PEM || "../../config/app/delegate/ssl/mongodb.pem";
config.mongodb.port = process.env.MONGODB_PORT || 27017;
config.mongodb.hostname = process.env.MONGODB_HOSTNAME || "localhost";
config.mongodb.db = process.env.MONGODB_IAM_DB || "chess";
config.mongodb.application_name = process.env.MONGODB_APP_NAME || "DELEGATE";
config.mongodb.statement_timeout = process.env.MONGODB_STATEMENT_TIMEOUT || 1000;
config.mongodb.query_timeout = process.env.MONGODB_QUERY_TIMEOUT || 1000;


config.web.pem = process.env.WEB_PEM || "../../config/app/delegate/ssl/delegate.pem";
config.web.port = process.env.WEB_PORT || 3000;
config.web.hostname = process.env.WEB_HOSTNAME || "localhost";

export default config;