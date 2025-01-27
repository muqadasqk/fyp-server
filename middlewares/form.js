import { input, is } from "../utils/functions.js";

const sanitize = (req, _, next) => {
    if (is.object(req.body)) {
        Object.keys(req.body).forEach(key => {
            if (!is.object(req.body[key])) {
                req.body[key] = input.sanitize(req.body[key]);
            }
        });
    }

    next();
};


export default { sanitize }