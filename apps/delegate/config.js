var config = {};

config.web = {};

config.web.key = process.env.WEB_KEY || "../../config/delegate-key.pem";
config.web.cert = process.env.WEB_CERT || "../../config/delegate-cert.pem";
config.web.port = process.env.WEB_PORT || 3000;
config.web.hostname = process.env.WEB_HOSTNAME || "127.0.0.1";

export default config;