import jwt from "jsonwebtoken";
import toast from "../../constants/toast.js";
import tryCatch from "./try.catch.js";
import env from "../../../config/env.js";

// function to validate token
const validateAndDecodeToken = (token) => tryCatch(() => {
    if (!token) throw new Error(toast.MISC.ACCESS_DENIED);

    return jwt.verify(token.replace('Bearer ', ''), env.secret.key);
});

export default validateAndDecodeToken;