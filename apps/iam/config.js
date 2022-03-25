const config = {};

config.web = {};
config.postgres = {};

config.postgres.cert = process.env.POSTGRES_CERT || "../../config/app/iam/ssl/postgres.crt";
config.postgres.port = process.env.POSTGRES_PORT || 5432;
config.postgres.hostname = process.env.POSTGRES_HOSTNAME || "localhost";
config.postgres.pass = process.env.POSTGRES_IAM_PASS || '<iam_app_password>';
config.postgres.user = process.env.POSTGRES_IAM_USER || "iam_app";
config.postgres.db = process.env.POSTGRES_IAM_DB || "chess";
config.postgres.application_name = process.env.POSTGRES_APP_NAME || "IAM";
config.postgres.statement_timeout = process.env.POSTGRES_STATEMENT_TIMEOUT || 1000;
config.postgres.query_timeout = process.env.POSTGRES_QUERY_TIMEOUT || 1000;


config.web.key = process.env.WEB_KEY || "../../config/app/iam/ssl/iam.key";
config.web.cert = process.env.WEB_CERT || "../../config/app/iam/ssl/iam.crt";
config.web.pem = process.env.WEB_PEM || "../../config/app/iam/ssl/iam.pem";
config.web.port = process.env.WEB_PORT || 8000;
config.web.hostname = process.env.WEB_HOSTNAME || "localhost";

export default config;