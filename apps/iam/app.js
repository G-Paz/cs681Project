// import modules
import fs from 'fs';
import { createServer } from 'https';
import pkg from 'pg';
import config from './config.js';
import express from 'express';

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

// createAccount('12131131111221', '12323');

// connect to db with pool
const pool = new Pool(db_config)
pool
    .connect()
    .then(client => {
        console.log('connected')
        client.release()
    })
    .catch(err => console.error('error connecting', err.stack))

// configure and start the server
// get server hostname and port from config
const server_hostname = config.web.hostname;
const server_port = config.web.port;

// load server key and cert
const server_options = {
    key: fs.readFileSync(config.web.key),
    cert: fs.readFileSync(config.web.cert)
};

// var express = require('express');

var app = express();

app.post('/createaccount', function (req, res) {
    // First read existing users.
    console.log(req);
    if(req.query.length == 2 && req.query.username && req.query.password){
        createAccount(req.query.username, req.query.password, pool);
    }else{
        // send back error
        console.log('123123')
    }
 });

// create the server
const server = createServer(server_options, app).on('error', (err)=> {
    console.log(err);
}).on('clientError', (err)=> {
    console.log(err);
});


// start server
server.listen(server_port, server_hostname, () => {
    console.log(`Server running at http://${server_hostname}:${server_port}/`);
});

function createAccount(username, password, client) {
    client.query({
        text: 'insert into user_auth.user '
            + '(first_name,last_name,email_address, creation_date, active,     modified_time) '
            + 'values'
            + '(        $1,      $1,            $1,  current_date,   true, current_timestamp)'
            + 'returning user_id',
        values: [username],
        callback: (err, res) => {
            if (err) {
                console.log(err.stack);
                client.query('ROLLBACK');
            } else {
                client.query({
                    text: 'insert into user_auth.user_sec '
                        + '(user_id,user_pass,auth_code) '
                        + 'values '
                        + '(     $1,       $2,       $2);',
                    values: [res.rows[0].user_id, password],
                    callback: (err1, res1) => {
                        if (err1) {
                            client.query('ROLLBACK');
                            console.log(err1.stack);
                        } else {
                            console.log("suucess" + res1.rows[0]);
                        }
                    },
                    name: "insertUserSec"
                });
            }
        },
        name: "insertUser"
    });
}
