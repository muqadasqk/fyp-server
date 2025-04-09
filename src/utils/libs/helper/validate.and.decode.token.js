import jwt from "jsonwebtoken";

import tryCatch from "./try.catch.js";
import env from "../../../config/env.js";

// function to validate token
const validateAndDecodeToken = (token) => tryCatch(() => {
    if (!token) throw new Error("Unauthenticated");

    return jwt.verify(token.replace('Bearer ', ''), env.app.secretKey);
});

export default validateAndDecodeToken;