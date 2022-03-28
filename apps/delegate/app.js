import fs from 'fs';
import { createServer } from 'https';
import config from './config.js';
import queries from './queries.js';
import { MongoClient } from 'mongodb';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const webappCert = fs.readFileSync(config.webapp.pem);

// Connection URL
const url = `mongodb://${config.mongodb.hostname}:${config.mongodb.port}?tls=true`;
const client = new MongoClient(url, {
    tlsCAFile: `${config.mongodb.pem}`,
    tlsCertificateKeyFile: `${config.web.pem}`,
    connectTimeoutMS: config.mongodb.connection_timeout,
    serverSelectionTimeoutMS: config.mongodb.selection_timeout,
    maxIdleTimeMS: config.mongodb.idle_timeout
});

async function main() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(config.mongodb.hostname.db);
    const games_collection = db.collection('games');

    // the following code examples can be pasted here...
    const filteredGames = await games_collection.find({}).toArray();
    console.log('Found games filtered by {} =>', filteredGames);

    // FIND EX - FILTER -- {} W/O FILTER
    // const filteredDocs = await collection.find({ a: 3 }).toArray();
    // console.log('Found documents filtered by { a: 3 } =>', filteredDocs);

    // UPDATE EX
    // const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
    // console.log('Updated documents =>', updateResult);

    return 'done.';
}

//https://www.npmjs.com/package/jsonwebtoken
const jwtOptions = { algorithm: 'RS256', expiresIn: '24h' };

var app = express().use(cors({}));

app.get('/gameState', async (req, res) => {
    console.log(req);
    if (Object.keys(req.query).length == 3 && req.query["gameId"] != null && req.query["token"].length > 0 && req.query["userId"] != null) {
        var userId = req.query["userId"]
        var token = req.query["token"]
        var gameId = req.query["gameId"]
        var isValid = false
        var errMsg = "Failed to verify user retrieving game state, user:" + userId + " gameId:" + gameId

        try {
            console.log("verifying user token")
            isValid = jwt.verify(token, webappCert, jwtOptions).userId == userId;
            console.log("verified user token")
        } catch (e) {
            console.error(errMsg)
            console.error(e)
            if (e.name == 'TokenExpiredError') {
                errMsg = "Token is expired."
            }
        } finally {
            // if the user was not validated return an error
            if (!isValid) {
                console.error(errMsg);
                res.status(500).send(errMsg);
            } else {
                res.status(200).json(queries.INIT_GAME_STATE_TEMPLATE_JSON)
            }
        }
    } else {
        console.error(errMsg);
        console.error("Invalid parameters.");
        res.status(500).send("There was an error.");
    }
});

// main()
//     .then(console.log)
//     .catch(console.error)
//     .finally(() => client.close());


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

server.listen(server_port, server_hostname, () => {
    console.log(`Server running at http://${server_hostname}:${server_port}/`);
});