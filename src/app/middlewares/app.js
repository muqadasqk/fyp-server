// middleware to register response method into response object
const response = (_, res, next) => {
    res.response = (code, message, data = null) => {
        const responseData = { success: code < 400, message };

        if (data && typeof data === "object") {
            Object.assign(responseData, data);
        }

        return res.status(code).json(responseData);
    };

    next();
};

// middleware to handle errors ocured during the execution of application
const errorHandler = (err, req, res, next) => {
    err.message = err.message ?? "Internal Server Error";
    err.statusCode = err.statusCode ?? 500;

    return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
};

export default { response, errorHandler }