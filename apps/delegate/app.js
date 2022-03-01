import { createServer } from 'https';
import config from './config.js';
import { MongoClient } from 'mongodb'

// Connection URL
const url = `mongodb://${db_config.host}:${db_config.port}?tls=true`;
const client = new MongoClient(url,{
    tlsCAFile: `${config.mongodb.pem}`,
    tlsCertificateKeyFile: `${config.web.pem}`
});

async function main() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(db_config.database);
    const game_collection = db.collection('game');

    // the following code examples can be pasted here...
    const filteredDocs = await game_collection.find({}).toArray();
    console.log('Found documents filtered by {} =>', filteredDocs);

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