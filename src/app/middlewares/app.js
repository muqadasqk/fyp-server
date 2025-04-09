// middleware to register response method into response object
const response = (_, res, next) => {
    res.response = (code, message, data = null) => {
        // initial response state
        const responseData = { success: code < 400, message };

        // if there a data; assign into the response data
        if (data && typeof data === "object") {
            Object.assign(responseData, data);
        }

        // send the response
        return res.status(code).json(responseData);
    };

    next();
};

// middleware to handle errors ocured during the execution of application
const errorHandler = (err, req, res, next) => {
    // set default error message and status code if there is not any
    err.message = err.message ?? "Internal Server Error";
    err.statusCode = err.statusCode ?? 500;

    // send the final organized error response
    return res
        .status(err.statusCode) // status code
        .json({ success: false, message: err.message }); // json response
};

export default { response, errorHandler }