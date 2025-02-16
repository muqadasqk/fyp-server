import '../src/utils/extensions/array.js';
import '../src/utils/extensions/object.js';
import '../src/utils/extensions/string.js';

import express from 'express';

import env from '../src/config/env.js';
import database from '../src/config/database.js';
import application from '../src/middlewares/app.js';
import apiRoutes from '../src/app.js';

// Express application instance
const app = express();

// Register application-level middlewares
app.use(
    express.json(),
    express.urlencoded({ extended: true }),
    application.response, // Custom application-level middleware to send organized response
    application.errorHandler // Custom middleware to catch errors during execution
);

// Register API routes
app.use('/api', apiRoutes);

// App listener
database.connect().then(() => {
    app.listen(env.server.port, () => {
        console.log(`The server has started at [http://127.0.0.1:${env.server.port}]`);
    });
}).catch((error) => {
    console.error('An error occurred while starting the server: ', error);
});
