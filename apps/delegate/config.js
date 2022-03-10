var config = {};

config.web = {};
config.mongodb = {};
config.webapp = {};

config.mongodb.pem = process.env.MONGODB_PEM || "../../config/app/delegate/ssl/mongodb.pem";
config.mongodb.port = process.env.MONGODB_PORT || 27017;
config.mongodb.hostname = process.env.MONGODB_HOSTNAME || "localhost";
config.mongodb.db = process.env.MONGODB_IAM_DB || "chess";
config.mongodb.application_name = process.env.MONGODB_APP_NAME || "DELEGATE";
config.mongodb.connection_timeout = process.env.MONGODB_CONNECTION_TIMEOUT || 1000;
config.mongodb.selection_timeout = process.env.MONGODB_SELECTION_TIMEOUT || 1000;
config.mongodb.idle_timeout = process.env.MONGODB_IDLE_TIMEOUT || 1000;

config.webapp.pem = process.env.WEB_PEM || "/Users/gustavopaz/Documents/GMU/GRAD/2022/681/Project/cs681Project/config/app/delegate/ssl/webapp copy.pem";

config.web.pem = process.env.WEB_PEM || "../../config/app/delegate/ssl/delegate.pem";
config.web.key = process.env.WEB_KEY || "../../config/app/delegate/ssl/delegate.key";
config.web.port = process.env.WEB_PORT || 8001;
config.web.hostname = process.env.WEB_HOSTNAME || "localhost";
config.web.name = process.env.WEB_HOSTNAME || "delegate";

export default config;