import env from "../../../config/env.js";

// function to execute block of code in try-catch exception handling
const tryCatch = async (fn, res = null) => {
    try {
        return await fn();
    } catch (error) {
        if (res === null) throw error;

        if (env.app.mode === "development") {
            return res.response(400, error.message, { stack: error.stack });
        }
        return res.response(error.status || error.statusCode || 400, error.message ?? "There was an internal server error");
    }
};

export default tryCatch;
