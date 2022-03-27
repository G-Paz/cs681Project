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

const serverCert = fs.readFileSync(config.web.pem);

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

//https://www.npmjs.com/package/jsonwebtoken
const jwtOptions = { algorithm: 'RS256', expiresIn: '24h' };

app.use(cors({
}))


app.post('/createaccount', async (req, res) => {
    console.log(req);
    if (Object.keys(req.query).length == 2 && req.query["username"].length > 0 && req.query["password"].length > 0) {
        var salt = bcrypt.genSaltSync();
        var username = req.query["username"]
        var hash = bcrypt.hashSync(req.query["password"], salt);
        var userId = -1;
        var token = null;
        var errMsg = "There was an error creating user:" + username

        // make connection to db
        await pool.connect()

        try {
            //start transaction
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
            token = jwt.sign({ userId: userId }, serverCert, jwtOptions);

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
        console.error("Invalid parameters.");
        res.status(500).send("Unable to create account.");
    }
});

app.post('/authenticate', async (req, res) => {
    console.log(req);
    if (Object.keys(req.query).length == 2 && req.query["username"].length > 0 && req.query["password"].length > 0) {
        var username = req.query["username"];
        var password = req.query["password"];
        var userId = -1;
        var role = null;
        var token = null;
        var errMsg = "There was an error verifying user:" + username

        // make connection to db
        await pool.connect()

        try {
            //start transaction
            await pool.query("BEGIN");
            //create the user
            await pool.query(queries.SELECT_USER_SEC, [username]).then(result => {
                console.log("verifying user")
                if (result.rows.length == 1 && result.rows[0].user_pass == bcrypt.hashSync(password, result.rows[0].salt)) {
                    console.log("signed in user:" + username);
                    userId = result.rows[0].user_id;
                    role = result.rows[0].role_name;
                }
                return result;
            });

            //token creation
            console.log("created user token");
            token = jwt.sign({ userId: userId }, serverCert, jwtOptions);

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
        console.error("Invalid parameters.");
        res.status(500).send("Unable to create account.");
    }
});

app.get('/isValidSession', async (req, res) => {
    // First read existing users.
    console.log(req);
    if (Object.keys(req.query).length == 2 && req.query["userId"] != null && req.query["token"].length > 0) {
        var userId = req.query["userId"];
        var token = req.query["token"];
        var errMsg = "There was an error. Please sign in again."
        var isValid = false;

        try {
            isValid = jwt.verify(token, serverCert, jwtOptions).userId == userId;
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
        console.error("Invalid parameters.");
        res.status(500).send(errMsg);
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

