// TODO: https://trello.com/c/CJB4suZl - Uncomment when the database connection is created.
// import { createServer } from 'https';

import { createServer } from 'http';
import config from './config.js';

const hostname = config.web.hostname;
const port = config.web.port;

// TODO: https://trello.com/c/CJB4suZl - Uncomment when the database connection is created.
// const options = {
//     key: fs.readFileSync(config.web.key),
//     cert: fs.readFileSync(config.web.cert)
// };

const server = createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});