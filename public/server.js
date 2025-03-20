import '../src/utils/extensions/object.js';
import '../src/utils/extensions/array.js';
import '../src/utils/extensions/string.js';

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import env from '../src/config/env.js';
import database from '../src/config/database.js';
import application from '../src/app/middlewares/app.js';
import apiRoutes from '../src/app.js';

// express application instance
const app = express();

// register application-level middlewares
app.use(
    cors({ origin: ["http://localhost:5173", "http://localhost:3000/", env.server.origin], credentials: true }),
    helmet(), // security middleware
    express.json(), // parse JSON request bodies
    express.urlencoded({ extended: true }),
    morgan("dev"), // logs requests
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: "Too many requests, Please try again later",
        standardHeaders: true,
        legacyHeaders: false,
    }), // rate limiter middleware
    application.response, // custom response middleware
    application.errorHandler // custom error handler middleware
);

// root route
app.get("/", (_, res) => {
    const developer = {
        name: "Muqadas Qaim Khani",
        email: "muqadasqaimkhani@gmail.com",
        role: "MERN Stack Developer",
        linkedIn: "https://linkedin.com/in/muqadas-qaim-khani-34382b247"
    };
    return res.response(200, "Backend is up and fine!", { developer });
});

// register API routes
app.use('/api', apiRoutes);

// Ddatabase connection & server startup
database.connect().then(() => {
    app.listen(env.server.port, () => {
        console.log(`Server is running on port ${env.server.port}`);
    });
}).catch((error) => {
    console.error("Database connection failed:", error);
});

// error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.status || err.statusCode || 500;
    res.response(statusCode, err.message || "Internal Server Error");
});
