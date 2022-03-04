import { createServer } from 'https';
import config from './config.js';
import { MongoClient } from 'mongodb';

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

const server = createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World');
});

server.listen(server_port, server_hostname, () => {
    console.log(`Server running at http://${server_hostname}:${server_port}/`);
});