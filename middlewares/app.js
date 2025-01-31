import { is, tryCatch } from "../utils/functions.js";

// middleware to register response method into response object
const response = (_, res, next) => {
    res.response = (code, message, data = null) => {
        const responseData = { message };
        if (!is.null(data) && is.object(data)) {
            for (const [key, value] of Object.entries(data)) {
                responseData[key] = value;
            }
        }
        return res.status(code).json(responseData);
    };

    next();
}

// middleware to handle errors ocured during the execution of application
const errorHandler = (error, req, res, next) => tryCatch(() => {
    throw {
        message: error.message,
        errors: error.errors,
        stack: error.stack,
    };
}, res);

export default { response, errorHandler }