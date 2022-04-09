import fs from 'fs';
import { createServer } from 'https';
import config from './config.js';
import queries from './queries.js';
import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import Chess from 'chess.js'

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
var database = null
const numGamesReturnedLimit = 10;

//https://www.npmjs.com/package/jsonwebtoken
const jwtOptions = { algorithm: 'RS256', expiresIn: '24h' };

var app = express().use(cors({}));

app.post('/createGame', async (req, res) => {

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
                // configure the initial game
                gameState = Object.assign({}, queries.INIT_GAME_STATE_TEMPLATE_JSON)
                gameState['br_player'] = userId
                gameState['w_player'] = -1
                gameState['current_player'] = userId
                gameState['fenState'] = Chess.Chess().fen()
                gameState['creationDate'] = new Date()
                gameState['lastModified'] = new Date()

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

app.post('/gameState', async (req, res) => {
    if (Object.keys(req.query).length == 3 && req.query["gameId"] != null && req.query["token"].length > 0 && req.query["userId"] != null) {
        var userId = req.query["userId"]
        var token = req.query["token"]
        var gameIdParam = ObjectId(req.query["gameId"])
        var isValid = false
        var errMsg = "Failed to verify user retrieving game state, user:" + userId + " gameId:" + gameIdParam
        var gameState = null
        // initialize the winner user id
        var winner = userId

        try {
            console.log("verifying user token")
            isValid = jwt.verify(token, webappCert, jwtOptions).userId == userId;
            console.log("verified user token")
            // load the game state from the database
            gameState = await database.collection('games').findOne({ _id: gameIdParam })
            // if the last player has not moved in 20 seconds - make the other player the winner
            if (gameState['current_player'] == userId) {
                winner = gameState['current_player']
            }
            // update the game database entry if the last time the game was modified was more than 20 seconds ago
            var dbState = await database.collection('games').updateOne({ _id: gameIdParam, winner_player: { $eq: null } , lastModified: { $lt: new Date(new Date() - 20000) } }, { $set: { winner_player: winner } })
            if (!dbState['acknowledged'] || dbState['matchedCount'] > 0) {
                console.log('a user timed out moves for a game ' + gameIdParam)
            }
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

app.post('/submitMove', async (req, res) => {
    console.log('submitMove start');
    // game move variables
    const fromColumnId = req.query["fromColumnId"];
    const fromRowId = req.query["fromRowId"];
    const toColumnId = req.query["toColumnId"];
    const toRowId = req.query["toRowId"];
    // validate the parameters
    if (Object.keys(req.query).length == 7 && req.query["gameId"] != null && req.query["token"].length > 0 && req.query["userId"] != null
        && validateMove(fromColumnId, fromRowId, toColumnId, toRowId)) {
        // game identifiers
        var userId = req.query["userId"]
        var token = req.query["token"]
        var gameIdParam = ObjectId(req.query["gameId"])
        // move status
        var isValid = false
        var errMsg = "Failed to verify user retrieving game state, user:" + userId + " gameId:" + gameIdParam
        var gameState = null

        try {
            console.log("verifying user token")
            isValid = jwt.verify(token, webappCert, jwtOptions).userId == userId;
            console.log("verified user token")

            // if valid token continue with move update
            if (isValid) {
                // load the game state from the database
                gameState = await database.collection('games').findOne({ _id: gameIdParam })
                if (gameState == null) {
                    console.log('game not found')
                    throw 'game not found; gameId:' + gameIdParam
                }
                console.log('loaded game state')

                // move the piece in the game state object
                var prevPiece = updatePiece(gameState, fromRowId, fromColumnId, '')
                // validate the user moving the piece can move the piece
                const newCurrentUserId = validatePieceMoved(prevPiece, userId, gameState['br_player'], gameState['w_player'], gameState['current_player'])
                // udpdate the game piece
                updatePiece(gameState, toRowId, toColumnId, prevPiece)
                console.log('moving piece: ' + prevPiece)

                // validate the movement
                console.log('validating movement of piece: ' + prevPiece)
                const chessBoard = Chess.Chess(gameState['fenState']);
                isValid = chessBoard.move({ from: fromColumnId.toLocaleLowerCase() + '' + fromRowId, to: toColumnId.toLocaleLowerCase() + '' + toRowId }) != null
                if (isValid) {
                    // if the movement is valid update the db entry
                    console.log('valid movement of piece: ' + prevPiece)
                    // check if the game has been won
                    var winner = null
                    if (chessBoard.in_checkmate()) {
                        // if so set the winner id and update the db entry and game state object
                        winner = userId;
                    }
                    // update the database entry
                    var dbState = await database.collection('games').updateOne({ _id: gameIdParam, winner_player: null }, { $set: { fenState: chessBoard.fen(), state: gameState['state'], current_player: newCurrentUserId, lastModified: new Date(), winner_player: winner } })
                    // verify if the game has been updated
                    if (!dbState['acknowledged']) {
                        throw 'the game was not updated'
                    } else {
                        if(dbState['matchedCount'] == 0){
                            console.log('game was not updated - but the query was acknowledged - the game must have finished')
                        }
                        // reload the game state to return to the app
                        gameState = await database.collection('games').findOne({ _id: gameIdParam })
                    }
                } else {
                    console.log('invalid movement of piece: ' + prevPiece)
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

app.get('/getAllGames', async (req, res) => {
    if (Object.keys(req.query).length == 2 && req.query["token"].length > 0 && req.query["userId"] != null) {
        var userId = req.query["userId"]
        var token = req.query["token"]
        var isValid = false
        var errMsg = "Failed to get all games, user:" + userId
        var gameStates = {}

        try {
            console.log("verifying user token")
            isValid = jwt.verify(token, webappCert, jwtOptions).userId == userId;
            console.log("verified user token")
            // load the game state from the database
            gameStates = await database.collection('games').find({ w_player: -1 }, { limit: numGamesReturnedLimit, sort: ['creationDate'] }).toArray()
        } catch (e) {
            console.error(errMsg)
            console.error(e)
            if (e.name == 'TokenExpiredError') {
                errMsg = "Token is expired."
            }
        } finally {
            // if the user was not validated return an error
            if (!isValid || gameStates == null) {
                console.error(errMsg);
                res.status(500).send(errMsg);
            } else {
                res.status(200).json(gameStates)
            }
        }
    } else {
        console.error(errMsg);
        console.error("Invalid parameters.");
        res.status(500).send("There was an error.");
    }
});

app.post('/joinGame', async (req, res) => {
    if (Object.keys(req.query).length == 3 && req.query["token"].length > 0 && req.query["gameId"] != null && req.query["userId"] != null) {
        var userId = req.query["userId"]
        var token = req.query["token"]
        var gameIdParam = ObjectId(req.query["gameId"])
        var isValid = false
        var errMsg = "Failed to join game, user:" + userId
        var gameFound = null

        try {
            console.log("verifying user token")
            isValid = jwt.verify(token, webappCert, jwtOptions).userId == userId;
            console.log("verified user token")
            // filter by game and by ones that still have the w_player as -1 - game not started
            var dbState = await database.collection('games').updateOne({ _id: gameIdParam, w_player: -1 }, { $set: { w_player: userId } })
            // check if by the time we update the db entry, another user has not updated the same entry
            if (!dbState['acknowledged'] || dbState['matchedCount'] == 0) {
                throw 'the game was not updated - game must have have already started'
            } else {
                // successfull updated game, return the game to the user
                console.log('updated game... user joining game')
                gameFound = await database.collection('games').findOne({ _id: gameIdParam })
            }
        } catch (e) {
            console.error(errMsg)
            console.error(e)
            if (e.name == 'TokenExpiredError') {
                errMsg = "Token is expired."
            }
        } finally {
            // if the user was not validated return an error
            if (!isValid || gameFound == null) {
                console.error(errMsg);
                res.status(500).send(errMsg);
            } else {
                res.status(200).json(gameFound)
            }
        }
    } else {
        console.error(errMsg);
        console.error("Invalid parameters.");
        res.status(500).send("There was an error.");
    }
});


app.post('/quitGame', async (req, res) => {
    if (Object.keys(req.query).length == 3 && req.query["token"].length > 0 && req.query["gameId"] != null && req.query["userId"] != null) {
        var userId = req.query["userId"]
        var token = req.query["token"]
        var gameIdParam = ObjectId(req.query["gameId"])
        var isValid = false
        var errMsg = "Failed to join game, user:" + userId
        var gameFound = null

        try {
            console.log("verifying user token")
            isValid = jwt.verify(token, webappCert, jwtOptions).userId == userId;
            console.log("verified user token")
            // filter by game and by ones that still have the w_player as -1 - game not started
            var dbState = await database.collection('games').deleteOne({ _id: gameIdParam, w_player: -1 }, { $set: { w_player: userId } })
            // check if by the time we update the db entry, another user has not updated the same entry
            if (!dbState['acknowledged']) {
                throw 'there was an error deleting an unstarted game'
            } else if (dbState['matchedCount'] == 0) {
                // get the other player's user id and set them as the winner
                var winner = gameState['br_player']
                if (gameState['br_player'] == userId) {
                    winner = gameState['w_player']
                }

                console.log('updating game - user ' + userId + '')
                var dbState = await database.collection('games').updateOne({ _id: gameIdParam, winner_player: { $eq: null } }, { $set: { winner_player: winner } })
            } else {
                console.log("game successfully deleted/quit before starting")
            }
        } catch (e) {
            console.error(errMsg)
            console.error(e)
            if (e.name == 'TokenExpiredError') {
                errMsg = "Token is expired."
            }
        } finally {
            // if the user was not validated return an error
            if (!isValid || gameFound == null) {
                console.error(errMsg);
                res.status(500).send(errMsg);
            } else {
                res.status(200).json(gameStates)
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

function validatePieceMoved(prevPiece, userId, br_player_id, w_player_id, current_player_id) {
    const isBrPlayerMovingBrPiece = prevPiece.startsWith('br_') && br_player_id == userId;
    const isWPlayerMovingWPiece = prevPiece.startsWith('w_') && w_player_id == userId;
    if (!(isBrPlayerMovingBrPiece || isWPlayerMovingWPiece)) {
        throw 'userId:' + userId + 'tried to move the piece:' + prevPiece
    } else if (current_player_id != userId) {
        throw 'userId:' + userId + 'tried to move out of turn'
    } else if (isBrPlayerMovingBrPiece) {
        return w_player_id
    } else {
        return br_player_id
    }
}

function updatePiece(gameState, fromRowId, fromColumnId, value) {
    var val = gameState['state'][fromRowId - 1]['columns'][fromColumnId.charCodeAt(0) - 65]['piece']
    gameState['state'][fromRowId - 1]['columns'][fromColumnId.charCodeAt(0) - 65]['piece'] = value
    return val
}

function validateMove(fromColumnId, fromRowId, toColumnId, toRowId) {
    return validateColumn(fromColumnId) && validateRow(fromRowId) && validateColumn(toColumnId) && validateRow(toRowId)
}

function validateColumn(columnId) {
    return columnId != null && columnId.length == 1 && columnId.charAt(0) >= 'A' && columnId.charAt(0) <= 'H'
}

function validateRow(rowId) {
    return rowId != null && rowId >= 1 && rowId <= 8
}
