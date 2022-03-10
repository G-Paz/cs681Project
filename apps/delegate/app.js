// import { createServer } from 'tls';
import { createServer } from 'https';
import express from 'express';
import cors from 'cors';
import config from './config.js';
import { MongoClient } from 'mongodb';
import fs from 'fs';

// Connection URL
const url = `mongodb://${config.mongodb.hostname}:${config.mongodb.port}?tls=true`;
const client = new MongoClient(url,{
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

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());


// configure and start the server
// get server hostname and port from config
const server_hostname = config.web.hostname;
const server_port = config.web.port;

const options = {
  key: fs.readFileSync(config.web.key),
  cert: fs.readFileSync(config.web.pem),

  // This is necessary only if using the client certificate authentication.
  requestCert: true,
  rejectUnauthorized: true,

  // This is necessary only if the client uses the self-signed certificate.
  ca: fs.readFileSync(config.webapp.pem)
}

var corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 // For legacy browser support
}

const app = express()

app.use(cors(corsOptions));

const server = createServer(options, app
//     (req, res) => {
//     // (socket) => {
//     res.writeHead(404);
//     // res.origin()
//     res.end('hello world\n');
//     // socket.write('welcome!\n');
//     // socket.setEncoding('utf8');
//     // socket.pipe(socket);
// }
);

server.listen(server_port, server_hostname, () => {
    console.log(`Server running at http://${server_hostname}:${server_port}/`);
}).on('session', (session) => {
    session.origin('https://localhost:4200', 'https://example.org');
  }).on('connection', (stream) => {
    console.log('insecure connection');
    console.log(stream);
}).on('secureConnection', (stream) => {
    // stream.authorized will be true if the client cert presented validates with our CA
    console.log('secure connection; client authorized: ', stream.authorized);
}).on('error', (err) => {
    // Handle errors here.
    console.log("hhuh");
    throw err;
}).on('tlsClientError', (err, socket) => {
    // Handle errors here.
    console.log("****************************");
    console.log(err);
    console.log("****************************");
    console.log(socket);
    console.log("****************************");
    // throw err;
}).on('clientError', (err, socket) => {
    // Handle errors here.
    console.log("clientError: ****************************");
    console.log(err);
    console.log("****************************");
    console.log(socket);
    console.log("clientError: ****************************");
    // throw err;
});