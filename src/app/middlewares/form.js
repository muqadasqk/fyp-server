import sanitizeInput from "sanitize-html";

const sanitize = (req, _, next) => {
    if (typeof req.body === "object") {
        Object.keys(req.body).forEach((key) => {
            const value = req.body[key];

            if (typeof value !== "object") {
                req.body[key] = sanitizeInput(value);
            }
        });
    }

    next();
};

export default { sanitize };
