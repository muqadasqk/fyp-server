import sanitizeInput from "sanitize-html";
import is from "../utils/libs/helper/is.js";

const sanitize = (req, _, next) => {
    if (is.object(req.body)) {
        Object.keys(req.body).forEach((key) => {
            if (!is.object(req.body[key])) {
                req.body[key] = sanitizeInput(req.body[key]);
            }
        });
    }

    next();
};


export default { sanitize }