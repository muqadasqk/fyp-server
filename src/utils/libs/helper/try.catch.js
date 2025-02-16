import env from "../../../config/env.js";
import httpCode from "../../constants/http.code.js";
import toast from "../../constants/toast.js";
import is from "./is.js";

// function to execute block of code in try-catch exception handling
const tryCatch = async (fn, res = null) => {
    try {
        return await fn();
    } catch (error) {
        if (is.null(res)) throw error;

        if (env.app.debug === "true") {
            return res.response(httpCode.SERVER_ERROR, error.message, { stack: error.stack });
        }
        return res.response(httpCode.SERVER_ERROR, toast.MISC.INTERNAL_ERROR, { error: error.message });
    }
};

export default tryCatch;
