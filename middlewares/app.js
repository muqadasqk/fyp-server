import { is } from "../utils/functions.js";

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

export default { response }