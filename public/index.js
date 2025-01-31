import express from 'express';
import env from '../config/env.js';
import database from '../config/database.js';
import application from '../middlewares/app.js';
import apiRoutes from '../app.js';

// express application instance
const app = express();

// registered application-level middlewares
app.use(
    express.json(),
    express.urlencoded({ extended: true }),
    application.response, // custom application-level middleware to send organized response
    application.errorHandler // custom middleware to catch errors occured during the execution of application
);

// register api routes
app.use('/api', apiRoutes);

// app listener
database.connect().then(() => {
    app.listen(env.server.port, () => {
        console.log(`The server has started at [http://127.0.0.1:${env.server.port}]`);
    });
}).catch((error) => {
    console.error('There an error occured, while starting the server: ', error);
});