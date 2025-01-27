import express from 'express';
import env from './config/env.js';
import database from './config/database.js';
import application from './middlewares/app.js';

// express application instance
const app = express();

// registered application-level middlewares
app.use(
    express.json(),
    express.urlencoded({ extended: true }),
    application.response, // custom application-level middleware to send organized response
);

// registered api routes
app.use('/api', apiRoutes);

// app listener
database.connect().then(() => app.listen(env.server.port)).catch(error => {
    throw new Error(error);
});