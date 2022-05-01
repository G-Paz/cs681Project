import fs from 'fs';
import { createServer } from 'https';
import config from './config.js';
import queries from './queries.js';
import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import Chess from 'chess.js'
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
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
const GAME_RETURN_LIMIT = 10;
const MOVE_TIME_LIMIT_MILISECONDS = 100000;

//https://www.npmjs.com/package/jsonwebtoken
const jwtOptions = { algorithm: 'RS256', expiresIn: '24h' };

var app = express().use(cors({
    origin: 'https://localhost:4200',
    methods: ['GET', 'POST']
}))

const GAMES_COLLECTION_NAME = 'games';

const TOKEN_PARAMETER = "token";
const GAME_ID_PARAMETER = "gameId";
const USER_ID_PARAMETER = "userId";
const USERNAME_PARAMETER = "username";

// var csrfProtection = csurf({ cookie: true })
// We need cookie-parser to be initialized as well.
// app.use('/', csrfProtection, (req, res, next) => {
//         res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: false }); 
//         next()
//     }
// );

// create endpoint to allow the app to create games
app.post('/api/createGame', async (req, res) => {
    var errMsg = "Error creating new game."
    try {
        if (Object.keys(req.query).length == 3
            && isValidStringParameter(req.query[TOKEN_PARAMETER])
            && isValidStringParameter(req.query[USER_ID_PARAMETER])
            && isValidStringParameter(req.query[USERNAME_PARAMETER])) {
            // intialize variables
            var userId = parseInt(req.query[USER_ID_PARAMETER])
            var token = req.query[TOKEN_PARAMETER]
            var username = req.query[USERNAME_PARAMETER]
            var isValid = false
            var gameState = null
            try {
                // validate the token
                isValid = validateToken(isValid, token, userId);

                if (isValid) {
                    // configure the initial game
                    gameState = Object.assign({}, queries.INIT_GAME_STATE_TEMPLATE_JSON)
                    gameState['w_player'] = userId
                    gameState['w_player_username'] = username
                    gameState['br_player'] = -1
                    gameState['br_player_username'] = -1
                    gameState['current_player'] = userId
                    gameState['fenState'] = Chess.Chess().fen()
                    gameState['creationDate'] = new Date()
                    gameState['lastModified'] = new Date()

                    // insert the game
                    const dbState = await database.collection(GAMES_COLLECTION_NAME).insertOne(gameState)
                    if (!dbState['acknowledged']) {
                        throw 'the game was not inserted'
                    }
                }
            } catch (e) {
                console.error(e)
                if (e.name == 'TokenExpiredError') {
                    errMsg = "Token is expired."
                }
                console.error(errMsg)
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
            res.status(500).send("There was an error.");
        }
    } catch {
        console.error(errMsg);
        res.status(500).send("There was an error.");
    }
});

// create endpoint to load the game state
app.post('/api/gameState', async (req, res) => {
    var errMsg = "Failed to verify user retrieving game state";
    try {
        if (Object.keys(req.query).length == 3
            && isValidStringParameter(req.query[GAME_ID_PARAMETER])
            && ObjectId.isValid(req.query[GAME_ID_PARAMETER])
            && isValidStringParameter(req.query[TOKEN_PARAMETER])
            && isValidStringParameter(req.query[USER_ID_PARAMETER])) {
            // intialize the vars
            var userId = parseInt(req.query[USER_ID_PARAMETER])
            var token = req.query[TOKEN_PARAMETER]
            var gameIdParam = ObjectId(req.query[GAME_ID_PARAMETER])
            var isValid = false
            var gameState = null
            // initialize the winner user id
            var winner = null

            try {
                // validate the token
                isValid = validateToken(isValid, token, userId);

                // load the game state from the database
                gameState = await database.collection(GAMES_COLLECTION_NAME).findOne({ _id: gameIdParam })

                // if the last player has not moved in 100 seconds - make the other player the winner
                if (gameState['current_player'] != null && gameState['w_player'] != null) {
                    // call the function to determine the winner if the game has timed-out
                    var winner_username = null

                    if (gameState['current_player'] != userId) {
                        winner = userId;
                        winner_username = gameState['br_player_username']

                        if (winner != gameState['br_player']) {
                            winner_username = gameState['w_player_username']
                        }
                    } else {
                        if (gameState['br_player'] == userId) {
                            winner = gameState['w_player'];
                            winner_username = gameState['w_player_username'];
                        } else {
                            winner = gameState['br_player'];
                            winner_username = gameState['br_player_username'];
                        }
                    }

                    // update the game database entry if the last time the game was modified was more than 100 seconds ago
                    var dbState = await database.collection(GAMES_COLLECTION_NAME).updateOne(timeOutFilter(gameIdParam, gameState['current_player']), timeOutUpdates(winner, winner_username))

                    // verify if the updates were made
                    if (!dbState['acknowledged'] || dbState['matchedCount'] > 0) {
                        console.log('winner of game: ' + gameIdParam + " is user:" + winner + " \nthe game timed out")
                        console.log('a user timed out moves for a game ' + gameIdParam)
                    } else {
                        // reset the time out since a player has not joined
                        var dbState = await database.collection(GAMES_COLLECTION_NAME).updateOne(resetTimeOutFilter(gameIdParam), resetTimeOutUpdates())

                        if (!dbState['acknowledged'] || dbState['matchedCount'] > 0) {
                            console.log('reset timer for game ' + gameIdParam)
                        }
                    }

                    //reload the game
                    gameState = await database.collection(GAMES_COLLECTION_NAME).findOne({ _id: gameIdParam })
                }

            } catch (e) {
                console.error(e)

                if (e.name == 'TokenExpiredError') {
                    errMsg = "Token is expired."
                }

                console.error(errMsg)
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
            res.status(500).send("There was an error.");
        }
    } catch {
        console.error(errMsg);
        res.status(500).send("There was an error.");
    }
});

// create endpoint to allow users to submit moves
app.post('/api/submitMove', async (req, res) => {
    var errMsg = "Failed to submit user move";

    try {
        // get the game move variables
        const fromColumnId = req.query["fromColumnId"];
        const fromRowId = req.query["fromRowId"];
        const toColumnId = req.query["toColumnId"];
        const toRowId = req.query["toRowId"];

        // validate the parameters
        if (Object.keys(req.query).length == 8
            && isValidStringParameter(req.query[GAME_ID_PARAMETER])
            && ObjectId.isValid(req.query[GAME_ID_PARAMETER])
            && isValidStringParameter(req.query[USERNAME_PARAMETER])
            && isValidStringParameter(req.query[TOKEN_PARAMETER])
            && isValidStringParameter(req.query[USER_ID_PARAMETER])
            && validateMove(fromColumnId, fromRowId, toColumnId, toRowId)) {

            // game identifiers
            var gameIdParam = ObjectId(req.query[GAME_ID_PARAMETER])
            var userId = parseInt(req.query[USER_ID_PARAMETER])
            var token = req.query[TOKEN_PARAMETER]
            var username = req.query[USERNAME_PARAMETER]

            // move status
            var isValid = false
            var gameState = null

            try {
                // validate the token
                isValid = validateToken(isValid, token, userId);

                // if valid token continue with move update
                if (isValid) {

                    // load the game state from the database
                    gameState = await database.collection(GAMES_COLLECTION_NAME).findOne({ _id: gameIdParam })
                    if (gameState == null) {
                        console.log('game not found')
                        throw 'game not found; gameId'
                    }
                    console.log('loaded game state')

                    // move the piece in the game state object
                    var prevPiece = updatePiece(gameState, fromRowId, fromColumnId, '')

                    // validate the user moving the piece can move the piece
                    const newCurrentUserId = validatePieceMoved(prevPiece, userId, gameState['br_player'], gameState['w_player'], gameState['current_player'])

                    // udpdate the game piece
                    updatePiece(gameState, toRowId, toColumnId, prevPiece)
                    console.log('moving piece: ' + prevPiece)

                    updateHistory(gameState, userId, username, fromRowId, fromColumnId, toRowId, toColumnId);
                    console.log('history updated')

                    // validate the movement
                    console.log('validating movement of piece: ' + prevPiece)

                    const chessBoard = Chess.Chess(gameState['fenState']);

                    isValid = makeBoardMove(chessBoard, fromColumnId, fromRowId, toColumnId, toRowId) != null

                    if (isValid) {
                        // if the movement is valid update the db entry
                        console.log('valid movement of piece: ' + prevPiece)

                        // check if the game has been won
                        var winner = null
                        var won_by = null
                        var winner_username = null

                        if (chessBoard.in_checkmate()) {
                            // if so set the winner id and update the db entry and game state object
                            winner = userId;
                            winner_username = username
                            won_by = 'Checkmate'
                        }

                        // update the database entry
                        var dbState = await database.collection(GAMES_COLLECTION_NAME)
                            .updateOne(checkmateFilter(gameIdParam)
                                , checkmateUpdates(chessBoard, gameState, newCurrentUserId, winner, won_by, winner_username))

                        // verify if the game has been updated
                        if (!dbState['acknowledged']) {
                            throw 'the game was not updated'
                        } else {
                            if (dbState['matchedCount'] == 0) {
                                console.log('game was not updated - but the query was acknowledged - the game must have finished')
                            }

                            // reload the game state to return to the app
                            gameState = await database.collection(GAMES_COLLECTION_NAME).findOne(simpleGameIdFilter(gameIdParam))
                        }
                    } else {
                        console.log('invalid movement of piece: ' + prevPiece)
                    }
                }
            } catch (e) {
                console.error(e)
                if (e.name == 'TokenExpiredError') {
                    errMsg = "Token is expired."
                }
                console.error(errMsg)
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
            res.status(500).send("There was an error.");
        }
    } catch {
        console.error(errMsg);
        res.status(500).send("There was an error.");
    }
});

// create endpoint for users to load all games
app.get('/api/getAllGames', async (req, res) => {
    var errMsg = "Failed to get all games"

    try {
        if (Object.keys(req.query).length == 2
            && isValidStringParameter(req.query[TOKEN_PARAMETER])
            && isValidStringParameter(req.query[USER_ID_PARAMETER])) {

            // initialize the variables
            var userId = parseInt(req.query[USER_ID_PARAMETER])
            var token = req.query[TOKEN_PARAMETER]
            var isValid = false
            var gameStates = {}

            try {
                isValid = validateToken(isValid, token, userId);

                // load the game state from the database
                gameStates = await database.collection(GAMES_COLLECTION_NAME).find(allGameFilter(userId), allGameConfig()).toArray()
            } catch (e) {
                console.error(e)
                if (e.name == 'TokenExpiredError') {
                    errMsg = "Token is expired."
                }
                console.error(errMsg)
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
            res.status(500).send("There was an error.");
        }
    } catch {
        console.error(errMsg);
        res.status(500).send("There was an error.");
    }
});

// create endpoint for users to join games
app.post('/api/joinGame', async (req, res) => {
    var isValid = false
    var errMsg = "Failed to join game, user:" + userId
    var gameFound = null

    try {
        if (Object.keys(req.query).length == 4
            && isValidStringParameter(req.query[TOKEN_PARAMETER])
            && isValidStringParameter(req.query[GAME_ID_PARAMETER])
            && ObjectId.isValid(req.query[GAME_ID_PARAMETER])
            && isValidStringParameter(req.query[USERNAME_PARAMETER])
            && isValidStringParameter(req.query[USER_ID_PARAMETER])) {

            //initialize the variables
            var userId = parseInt(req.query[USER_ID_PARAMETER])
            var token = req.query[TOKEN_PARAMETER]
            var username = req.query[USERNAME_PARAMETER]
            var gameIdParam = ObjectId(req.query[GAME_ID_PARAMETER])

            try {
                // validate the token param
                isValid = validateToken(isValid, token, userId);

                // filter by game and by ones that still have the w_player as -1 - game not started
                var dbState = await database.collection(GAMES_COLLECTION_NAME).updateOne(getJoinGameFilter(gameIdParam), getJoinGameUpdates(userId, username))

                // check if by the time we update the db entry, another user has not updated the same entry
                if (!dbState['acknowledged'] || dbState['matchedCount'] == 0) {
                    throw 'the game was not updated - game must have have already started'
                } else {
                    // successfull updated game, return the game to the user
                    console.log('updated game... user joining game')
                    gameFound = await database.collection(GAMES_COLLECTION_NAME).findOne({ _id: gameIdParam })
                }
            } catch (e) {
                console.error(e)
                if (e.name == 'TokenExpiredError') {
                    errMsg = "Token is expired."
                }
                console.error(errMsg)
            }
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
});

// create endpoint to allow users to quit the game
app.post('/api/quitGame', async (req, res) => {
    var errMsg = "Failed to quit the game."

    if (Object.keys(req.query).length == 3 
        && isValidStringParameter(req.query[TOKEN_PARAMETER])
        && isValidStringParameter(req.query[GAME_ID_PARAMETER])
        && ObjectId.isValid(req.query[GAME_ID_PARAMETER])
        && isValidStringParameter(req.query[USER_ID_PARAMETER])) {
        
        // initialize the vars
        var userId = parseInt(req.query[USER_ID_PARAMETER])
        var token = req.query[TOKEN_PARAMETER]
        var gameIdParam = ObjectId(req.query[GAME_ID_PARAMETER])
        var isValid = false
        var gameState = null

        try {
            // validate the token
            isValid = validateToken(isValid, token, userId);

            // filter by game and by ones that still have the w_player as -1 - game not started
            gameState = await database.collection(GAMES_COLLECTION_NAME).deleteOne(deleteExistingUnstartedGameFilter(gameIdParam))

            // check if by the time we update the db entry, another user has not updated the same entry
            if (!gameState['acknowledged']) {
                throw 'there was an error deleting an unstarted game'
            } else if (gameState['deletedCount'] == 0) {
                // get the other player's user id and set them as the winner
                // load the game
                gameState = await database.collection(GAMES_COLLECTION_NAME).findOne({ _id: gameIdParam })

                if (gameState != null) {
                    // determine the winner
                    var winner = gameState['br_player']
                    var winner_username = gameState['br_player_username']
                    if (gameState['br_player'] == userId) {
                        winner = gameState['w_player']
                        winner_username = gameState['w_player_username']
                    }

                    // update the game entry
                    gameState = await database.collection(GAMES_COLLECTION_NAME).updateOne(quitExistingGameFilter(gameIdParam), quitExistingGameUpdates(winner, winner_username))
                } else {
                    throw 'the game does not exist anymore'
                }
            } else if (gameState['deletedCount'] > 0) {
                console.log("game successfully deleted/quit before starting")
            }
        } catch (e) {
            console.error(e)
            if (e.name == 'TokenExpiredError') {
                errMsg = "Token is expired."
            }
            console.error(errMsg)
        } finally {
            // if the user was not validated return an error
            if (!isValid || gameState == null) {
                console.error(errMsg);
                res.status(500).send(errMsg);
            } else {
                res.status(200).json(null)
            }
        }
    } else {
        console.error(errMsg);
        res.status(500).send("There was an error.");
    }
});

// create endpoint to get a user's game profile
app.post('/api/getGameProfile', async (req, res) => {
    var errMsg = "Failed to get all games for a user."
    try {
        if (Object.keys(req.query).length == 3 
            && isValidStringParameter(req.query[TOKEN_PARAMETER])
            && isValidStringParameter(req.query[USER_ID_PARAMETER])
            && isValidStringParameter(req.query[USERNAME_PARAMETER])) {

            // intialize the vars
            var userId = parseInt(req.query[USER_ID_PARAMETER])
            var token = req.query[TOKEN_PARAMETER]
            var username = req.query[USERNAME_PARAMETER]
            var isValid = false
            var profile = null

            try {
                // validate the token parameter
                isValid = validateToken(isValid, token, userId);

                // load the game state from the database
                var gamesLostAsBr = await database.collection(GAMES_COLLECTION_NAME).countDocuments(allSingleUserGamesLostAsBr(username))
                var gamesLostAsW = await database.collection(GAMES_COLLECTION_NAME).countDocuments(allSingleUserGamesLostAsW(username))
                var gamesAsBr = await database.collection(GAMES_COLLECTION_NAME).find(gameAsBrFilter(username)).toArray()
                var gamesAsW = await database.collection(GAMES_COLLECTION_NAME).find(gameAsWFilter(username)).toArray()
                if (gamesAsBr.length > 0 || gamesAsW.length > 0) {
                    profile = {
                        username: username,
                        wins: gamesAsBr.length + gamesAsW.length - (gamesLostAsBr + gamesLostAsW),
                        losses: gamesLostAsBr + gamesLostAsW,
                        games: [].concat(gamesAsBr).concat(gamesAsW)
                    }
                } else {
                    profile = {}
                }

            } catch (e) {
                console.error(e)
                if (e.name == 'TokenExpiredError') {
                    errMsg = "Token is expired."
                }
                console.error(errMsg)
            } finally {
                // if the user was not validated return an error
                if (!isValid || profile == null) {
                    console.error(errMsg);
                    res.status(500).send(errMsg);
                } else {
                    res.status(200).json(profile)
                }
            }
        } else {
            console.error(errMsg);
            res.status(500).send("There was an error.");
        }
    } catch {
        console.error(errMsg);
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
    cert: fs.readFileSync(config.web.cert),
    ca: fs.readFileSync(config.webapp.cert)
};

// create the server
const server = createServer(server_options, app);

// connect to the database and then start the application
client.connect().then(mClient => {
    console.log('Connected successfully to database');
    database = mClient.db(config.mongodb.hostname.db);
    if (database == null) {
        throw 'Unable to create datbase!!'
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

// --------- Query filters, configs, and updates --------- //

function gameAsWFilter(username) {
    return { w_player_username: username
            , winner_player: { $ne: null } };
}

function gameAsBrFilter(username) {
    return { br_player_username: username
            , winner_player: { $ne: null } };
}

function getJoinGameFilter(gameIdParam) {
    return { _id: gameIdParam
            , br_player: -1 };
}

function deleteExistingUnstartedGameFilter(gameIdParam) {
    return { _id: gameIdParam
            , br_player: -1 };
}

function quitExistingGameFilter(gameIdParam) {
    return { _id: gameIdParam
            , winner_player: { $eq: null } };
}

function allGameConfig() {
    return { limit: GAME_RETURN_LIMIT
            , sort: ['creationDate'] };
}

function allGameFilter(userId) {
    return { br_player: -1
            , w_player: { $ne: userId } };
}

function simpleGameIdFilter(gameIdParam) {
    return { _id: gameIdParam };
}

function checkmateFilter(gameIdParam) {
    return { _id: gameIdParam
            , winner_player: null };
}

function timeOutFilter(gameIdParam, current_player_id) {
    return { _id: gameIdParam
            , winner_player: { $eq: null }
            , current_player: { $ne: current_player_id }
            , br_player: { $nin: [-1, null] }
            , w_player: { $ne: null }
            , lastModified: { $lt: new Date(new Date() - MOVE_TIME_LIMIT_MILISECONDS) } };
}

function resetTimeOutFilter(gameIdParam) {
    return { _id: gameIdParam
            , winner_player: { $eq: null }
            , br_player: { $eq: -1 } };
}

function allSingleUserGamesLostAsW(username) {
    return { w_player_username: { $eq: username }
            , winner_player_username: { $nin: [username, null] } }
}

function allSingleUserGamesLostAsBr(username) {
    return { br_player_username: { $eq: username }
            , winner_player_username: { $nin: [username, null] } }
}

// --------- Update functions --------- //

function getJoinGameUpdates(userId, username) {
    return { $set: { br_player: userId
                    , br_player_username: username } };
}

function quitExistingGameUpdates(winner, winner_username) {
    return { $set: { winner_player: winner
                    , winner_player_username: winner_username
                    , winner_by: 'Player quit' } };
}

function makeBoardMove(chessBoard, fromColumnId, fromRowId, toColumnId, toRowId) {
    return chessBoard.move({ from: fromColumnId.toLocaleLowerCase() + '' + fromRowId, to: toColumnId.toLocaleLowerCase() + '' + toRowId });
}

function checkmateUpdates(chessBoard, gameState, newCurrentUserId, winner, won_by, winner_username) {
    return { $set: { fenState: chessBoard.fen()
                    , state: gameState['state']
                    , history: gameState['history']
                    , current_player: newCurrentUserId
                    , lastModified: new Date()
                    , winner_player: winner
                    , winner_player_username: winner_username
                    , winner_by: won_by } };
}

function timeOutUpdates(winner, winner_username) {
    return { $set: { winner_player: winner
                    , winner_player_username: winner_username
                    , winner_by: 'Player timed-out' } };
}

function resetTimeOutUpdates() {
    return { $set: { lastModified: new Date() } };
}

// --------- Helper methods --------- //

function updateHistory(gameState, userId, username, fromRowId, fromColumnId, toRowId, toColumnId) {
    gameState['history'].push(
        {
            "userId": userId
            , "username": username
            , "fromRowId": fromRowId
            , "fromColumnId": fromColumnId
            , "toRowId": toRowId
            , "toColumnId": toColumnId
        }
    )
}

function validatePieceMoved(prevPiece, userId, br_player_id, w_player_id, current_player_id) {
    const isBrPlayerMovingBrPiece = prevPiece.startsWith('br-') && br_player_id == userId;
    const isWPlayerMovingWPiece = prevPiece.startsWith('w-') && w_player_id == userId;
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
    var val = gameState['state'][fromRowId - 1]['columns'][calcColumnId(fromColumnId)]['piece']
    gameState['state'][fromRowId - 1]['columns'][calcColumnId(fromColumnId)]['piece'] = value
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

function calcColumnId(fromColumnId) {
    return fromColumnId.charCodeAt(0) - 65;
}

function validateToken(isValid, token, userId) {
    console.log("verifying user token");
    isValid = jwt.verify(token, webappCert, jwtOptions).userId == userId;
    console.log("verified user token");
    return isValid;
}

function isValidStringParameter(parameter) {
    return parameter != null && parameter.length > 0;
}
