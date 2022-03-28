var config = {};

config.web = {};
config.webapp = {};
config.mongodb = {};

config.mongodb.pem = process.env.MONGODB_PEM || "../../config/app/delegate/ssl/mongodb.pem";
config.mongodb.port = process.env.MONGODB_PORT || 27017;
config.mongodb.hostname = process.env.MONGODB_HOSTNAME || "localhost";
config.mongodb.db = process.env.MONGODB_IAM_DB || "chess";
config.mongodb.application_name = process.env.MONGODB_APP_NAME || "DELEGATE";
config.mongodb.connection_timeout = process.env.MONGODB_CONNECTION_TIMEOUT || 1000;
config.mongodb.selection_timeout = process.env.MONGODB_SELECTION_TIMEOUT || 1000;
config.mongodb.idle_timeout = process.env.MONGODB_IDLE_TIMEOUT || 1000;

config.webapp.pem = process.env.WEBAPP_PEM || "../../config/app/delegate/ssl/webapp.pem";

config.web.key = process.env.WEB_KEY || "../../config/app/delegate/ssl/delegate.key";
config.web.cert = process.env.WEB_CERT || "../../config/app/delegate/ssl/delegate.crt";
config.web.pem = process.env.WEB_PEM || "../../config/app/delegate/ssl/delegate.pem";
config.web.port = process.env.WEB_PORT || 3000;
config.web.hostname = process.env.WEB_HOSTNAME || "localhost";

export default config;