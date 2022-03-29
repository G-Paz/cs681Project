import fs from 'fs';
import { createServer } from 'https';
import config from './config.js';
import queries from './queries.js';
import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const webappCert = fs.readFileSync(config.webapp.pem);

// Connection URL to the database
const url = `mongodb://${config.mongodb.hostname}:${config.mongodb.port}?tls=true`;
// create the client and configuration
const client = new MongoClient(url, {
    tlsCAFile: `${config.mongodb.pem}`,
    tlsCertificateKeyFile: `${config.web.pem}`,
    connectTimeoutMS: config.mongodb.connection_timeout,
    serverSelectionTimeoutMS: config.mongodb.selection_timeout,
    maxIdleTimeMS: config.mongodb.idle_timeout
});
// create a variable to keep track of the database we're connecting to
var session = null
var database = null
// transaction options when connecting to mongodb
const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' }
};

//https://www.npmjs.com/package/jsonwebtoken
const jwtOptions = { algorithm: 'RS256', expiresIn: '24h' };

var app = express().use(cors({}));

app.get('/createGame', async (req, res) => {
    // console.log(req);
    if (Object.keys(req.query).length == 2 && req.query["token"].length > 0 && req.query["userId"] != null) {
        var userId = parseInt(req.query["userId"])
        var token = req.query["token"]
        var isValid = false
        var errMsg = "Creating new game for user:" + userId
        var gameState = null
        try {
            console.log("verifying user token")
            isValid = jwt.verify(token, webappCert, jwtOptions).userId == userId;
            console.log("verified user token")

            if (isValid) {
                // configure the game
                gameState = Object.assign({}, queries.INIT_GAME_STATE_TEMPLATE_JSON)
                gameState['br-player'] = userId
                gameState['w-player'] = -1

                // insert the game
                const dbState = await database.collection('games').insertOne(gameState)
                if (!dbState['acknowledged']) {
                    throw 'the game was not inserted'
                }
            }
        } catch (e) {
            console.error(errMsg)
            console.error(e)
            if (e.name == 'TokenExpiredError') {
                errMsg = "Token is expired."
            }
        } finally {
            // if the user was not validated return an error
            if (!isValid || gameState == null) {
                console.error(errMsg);
                res.status(500).send(errMsg);
            } else {
                res.status(200).json(gameState)
            }
        }
    } else {
        console.error(errMsg);
        console.error("Invalid parameters.");
        res.status(500).send("There was an error.");
    }
});

app.get('/gameState', async (req, res) => {
    // console.log(req);
    if (Object.keys(req.query).length == 3 && req.query["gameId"] != null && req.query["token"].length > 0 && req.query["userId"] != null) {
        var userId = req.query["userId"]
        var token = req.query["token"]
        var gameIdParam = ObjectId(req.query["gameId"])
        var isValid = false
        var errMsg = "Failed to verify user retrieving game state, user:" + userId + " gameId:" + gameIdParam
        var gameState = null

        try {
            console.log("verifying user token")
            isValid = jwt.verify(token, webappCert, jwtOptions).userId == userId;
            console.log("verified user token")
            // load the game state from the database
            gameState = await database.collection('games').findOne({ _id: gameIdParam })
        } catch (e) {
            console.error(errMsg)
            console.error(e)
            if (e.name == 'TokenExpiredError') {
                errMsg = "Token is expired."
            }
        } finally {
            // if the user was not validated return an error
            if (!isValid || gameState == null) {
                console.error(errMsg);
                res.status(500).send(errMsg);
            } else {
                res.status(200).json(gameState)
            }
        }
    } else {
        console.error(errMsg);
        console.error("Invalid parameters.");
        res.status(500).send("There was an error.");
    }
});

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
const server = createServer(server_options, app).on('error', (err) => {
    console.log(err);
}).on('clientError', (err) => {
    console.log(err);
}).on('close', (err) => {
    console.log(err);
});

// connect to the database and then start the application
client.connect().then(mClient => {
    console.log('Connected successfully to database');
    database = mClient.db(config.mongodb.hostname.db);
    if (database == null) {
        throw 'Unable to create datbase'
    }
    // else continue and start the server
    server.listen(server_port, server_hostname, () => {
        console.log(`Server running at http://${server_hostname}:${server_port}/`);
    });
}).catch(reason => {
    console.log("There was an error connecting to the database.");
    console.error(reason)
    server.close()
    client.close()
}).finally(() => {
    console.log("ready to go");
})