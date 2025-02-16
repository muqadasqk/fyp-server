import is from "../utils/libs/helper/is.js";
import tryCatch from "../utils/libs/helper/try.catch.js";

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
    throw error;
}, res);

export default { response, errorHandler }