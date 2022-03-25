// import modules
import fs from 'fs';
import { createServer } from 'https';
import pkg from 'pg';
import config from './config.js';
import queries from './queries.js';
import roles from './roles.js';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const { Pool } = pkg;

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

// connect to db with pool
const pool = new Pool(db_config)

// configure and start the server
// get server hostname and port from config
const server_hostname = config.web.hostname;
const server_port = config.web.port;

// load server key and cert
const server_options = {
    key: fs.readFileSync(config.web.key),
    cert: fs.readFileSync(config.web.cert)
};

var app = express();
app.use(cors({
}))
app.post('/createaccount', function (req, res) {
    // First read existing users.
    console.log(req);
    if (Object.keys(req.query).length == 2 && req.query["username"].length > 0 && req.query["password"].length > 0) {
        var salt = bcrypt.genSaltSync();
        var username = req.query["username"]
        var password = req.query["password"]
        var hash = bcrypt.hashSync(password, salt);
        var userId = -1;

        pool.connect()
            .then(client => {
                console.log("creating user")
                client.query({
                    text: queries.CREATE_USER_SQL,
                    values: [username],
                    callback: (err, res) => {
                        console.log("created user")
                        if (err) {
                            rollbackError(err, client);
                        } else {
                            console.log("creating user_seq")
                            userId = res.rows[0].user_id;
                            client.query({
                                text: queries.CREATE_USER_SEQ_SQL,
                                values: [userId, hash, salt],
                                callback: (err1, res1) => {
                                    if (err1) {
                                        rollbackError(err1, client);
                                    } else {
                                        console.log("created user:" + username);
                                    }
                                },
                                name: "security"
                            });
                            console.log("assigning role")
                            client.query({
                                text: queries.ASSIGN_ROLE_TO_USER,
                                values: [userId, roles.HIKARU_ROLE_ID],
                                callback: (err1, res1) => {
                                    if (err1) {
                                        rollbackError(err1, client);
                                    } else {
                                        console.log("assigned " + roles.HIKARU_ROLE_NAME + " role to user:" + username);
                                    }
                                },
                                name: "roles"
                            });
                        }
                    },
                    name: "insertUser"
                });
            })
            .catch(err => console.error('error connecting', err.stack))
        if (userId < 0) {
            console.error("There was an error creating user:" + username);
            res.status(500).send("Unable to create account.");
        } else {
            res.status(200).json({ id: userId, username: username, role: roles.HIKARU_ROLE_NAME })
        }
    } else {
        console.error("There was an error creating user:" + username);
        console.error("Invalid parameters.");
        res.status(500).send("Unable to create account.");
    }
});

// create the server
const server = createServer(server_options, app).on('error', (err) => {
    console.log(err);
}).on('clientError', (err) => {
    console.log(err);
}).on('close', (err) => {
    console.log(err);
});

// start server
server.listen(server_port, server_hostname, () => {
    console.log(`Server running at http://${server_hostname}:${server_port}/`);
});

function rollbackError(err, client) {
    console.error(err.stack);
    client.query('ROLLBACK');
}

