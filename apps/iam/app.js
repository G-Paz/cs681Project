// import modules
import fs from 'fs';
import { createServer } from 'https';
import pkg from 'pg';
import config from './config.js';

const { Client, Pool } = pkg;

// configure connection to postgres
const db_config = {
    // GENERAL
    database: config.postgres.db,
    host: config.postgres.hostname,
    port: config.postgres.port,
    application_name: config.postgres.application_name,
    // TIMEOUTS
    statement_timeout: config.postgres.statement_timeout,
    query_timeout: config.postgres.query_timeout,
    // SECURITY
    user: config.postgres.user,
    password: config.postgres.pass,
    ssl: {
        rejectUnauthorized: true,
        key: fs.readFileSync(config.web.key),
        cert: fs.readFileSync(config.web.cert),
        ca: [fs.readFileSync(config.postgres.cert)]
    }
}

// connect to db with single client
const client = new Client(db_config)
client.connect(err => {
    if (err) {
        console.error('error connecting', err.stack)
    } else {
        console.log('connected')
    }
})

client.query('SELECT NOW() as now', (err, res) => {
    if (err) {
        console.log(err.stack)
    } else {
        console.log(res.rows[0])
    }
})

// connect to db with pool
const pool = new Pool(db_config)
pool
    .connect()
    .then(client => {
        console.log('connected')
        client.release()
    })
    .catch(err => console.error('error connecting', err.stack))
    .then(() => pool.end())

// configure and start the server
// get server hostname and port from config
const server_hostname = config.web.hostname;
const server_port = config.web.port;

// load server key and cert
const server_options = {
    key: fs.readFileSync(config.web.key),
    cert: fs.readFileSync(config.web.cert)
};

// create the server
const server = createServer(server_options, function (req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World');
});

// start server
server.listen(server_port, server_hostname, () => {
    console.log(`Server running at http://${server_hostname}:${server_port}/`);
});