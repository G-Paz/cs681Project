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
import jwt from 'jsonwebtoken';

const { Pool } = pkg;

const webappCert = fs.readFileSync(config.webapp.pem);

const U_PARAM = "username";
const P_PARAM = "password";
const ID_PARAM = "userId";
const TOKEN_PARAM = "token";

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
    cert: fs.readFileSync(config.web.cert),
    ca: fs.readFileSync(config.webapp.cert)
};

//configure tokenization util
const jwtOptions = { algorithm: 'RS256', expiresIn: '24h' };

// configure app
var app = express().use(cors({
    origin: 'https://localhost:4200',
    methods: ['GET', 'POST']
}));

// add create account post endpoint
app.post('/iapi/createaccount', async (req, res) => {
    // init the error message
    var errMsg = "There was an error creating user:" + username
    try {
        if (Object.keys(req.query).length == 2
            && isValidStringParameter(req.query[U_PARAM])
            && isValidStringParameter(req.query[P_PARAM])) {
            // create salt for new user creating account
            var salt = bcrypt.genSaltSync();
            // extract the valid string parameter
            var username = req.query[U_PARAM]
            // hash the p paramter with the salt
            var hash = bcrypt.hashSync(req.query[P_PARAM], salt);
            // init the user id
            var userId = -1;
            // init the token
            var token = null;

            // make connection to db
            await pool.connect()

            try {
                //start the transaction
                await pool.query("BEGIN");
                //create the user
                await pool.query(queries.CREATE_USER_SQL, [username, null]).then(result => {
                    console.log("created user:" + username);
                    userId = result.rows[0].user_id;
                    return result;
                })
                //store seq
                await pool.query(queries.CREATE_USER_SEQ_SQL, [userId, hash, salt]).then(result => {
                    console.log("created req:" + username);
                    return result;
                });
                //assign role
                await pool.query(queries.ASSIGN_ROLE_TO_USER, [userId, roles.HIKARU_ROLE_ID]).then(result => {
                    console.log("assigned role:" + username);
                    return result;
                });

                //token creation
                console.log("created user token");
                token = jwt.sign({ userId: userId }, webappCert, jwtOptions);

                // commit queries
                await pool.query("COMMIT");
            } catch (e) {
                // if there was an exception rollback
                console.error("failed to create user")
                console.error(e)
                if (e.constraint == 'user_uk01') {
                    errMsg = "Username: '" + username + "' is already being used."
                }
                await pool.query("ROLLBACK");
            } finally {
                // if the user was not created successfully return an error
                if (userId < 0 || token == null) {
                    console.error(errMsg);
                    res.status(500).send(errMsg);
                } else {
                    res.status(200).json({ id: userId, username: username, role: roles.HIKARU_ROLE_NAME, token: token })
                }
            }
        } else {
            console.error(errMsg);
            res.status(500).send("Unable to create account.");
        }
    } finally {
        console.error(errMsg);
        res.status(500).send("Unable to create account.");
    }
});

// endpoint to authenticate user sign in
app.post('/iapi/authenticate', async (req, res) => {
    var errMsg = "There was an error verifying user"
    try {
        if (Object.keys(req.query).length == 2
            && isValidStringParameter(req.query[U_PARAM])
            && isValidStringParameter(req.query[P_PARAM])) {
            var username = req.query[U_PARAM];
            var password = req.query[P_PARAM];
            var userId = -1;
            var role = null;
            var token = null;

            // make connection to db
            await pool.connect()

            try {
                //start transaction
                await pool.query("BEGIN");
                //create the user
                await pool.query(queries.SELECT_USER_SEC, [username]).then(result => {
                    console.log("verifying user")
                    if (result.rows.length == 1 && result.rows[0].user_pass == bcrypt.hashSync(password, result.rows[0].salt)) {
                        console.log("signed in user");
                        userId = result.rows[0].user_id;
                        role = result.rows[0].role_name;
                    }
                    return result;
                });

                //token creation
                console.log("created user token");
                token = jwt.sign({ userId: userId }, webappCert, jwtOptions);

                // commit queries
                await pool.query("COMMIT");
            } catch (e) {
                // if there was an exception rollback
                console.error("failed to verify user")
                console.error(e)
                await pool.query("ROLLBACK");
            } finally {
                // if the user was not created successfully return an error
                if (userId < 0 || token == null || role == null) {
                    console.error(errMsg);
                    res.status(500).send(errMsg);
                } else {
                    res.status(200).json({ id: userId, username: username, role: role, token: token })
                }
            }
        } else {
            console.error(errMsg);
            res.status(500).send("Unable to create account.");
        }
    } catch {
        console.error(errMsg);
        res.status(500).send("Unable to create account.");
    }
});

// endpoint to determine if the user is in a valid session
app.get('/isValidSession', async (req, res) => {
    // First read existing users.
    var errMsg = "There was an error. Please sign in again."
    try {
        if (Object.keys(req.query).length == 2
            && isValidStringParameter(req.query[ID_PARAM])
            && isValidStringParameter(req.query[TOKEN_PARAM])) {

            var userId = req.query[ID_PARAM];
            var token = req.query[TOKEN_PARAM];
            var isValid = false;

            try {
                isValid = jwt.verify(token, webappCert, jwtOptions).userId == userId;
            } catch (e) {
                // if there was an exception rollback
                console.error("failed to validate token")
                console.error(e)
                if (e.name == 'TokenExpiredError') {
                    errMsg = "Token is expired."
                }
            } finally {
                // if the user was not created successfully return an error
                if (userId < 0 || token == null || !isValid) {
                    console.error(errMsg);
                    res.status(500).send(errMsg).json({ isValid: isValid });
                } else {
                    res.status(200).json({ isValid: isValid })
                }
            }
        } else {
            console.error(errMsg);
            res.status(500).send("Server error.");
        }
    } catch {
        console.error(errMsg);
        res.status(500).send("Server error.");
    }
});

// create and start the server
createServer(server_options, app).listen(server_port, server_hostname, () => {
    console.log(`Server running at http://${server_hostname}:${server_port}/`);
});

// helper method to varify non-empty parameters
function isValidStringParameter(parameter) {
    return parameter != null && parameter.length > 0;
}
