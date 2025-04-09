import tryCatch from "../../utils/libs/helper/try.catch.js";
import validateAndDecodeToken from "../../utils/libs/helper/validate.and.decode.token.js";
import userService from "../../app/services/user.service.js";

// middleware to authenticate user using JWT token
const authenticate = (req, res, next) => tryCatch(async () => {
    // verify token from request headers; extract user ID from JWT token payload
    const { id } = await validateAndDecodeToken(req.headers.authorization);

    // retrieve user by user ID extracted from JWT token payload 
    const user = await userService.retrieveOne({ _id: id });

    // return back with access denied response whtether user is not found or user status is not active
    if (!user || user.status !== "active") return res.response(400, "Unauthenticated");

    // append ID as string also
    user.id = id;

    // add user to request object
    req.user = user;

    next();
}, res);

// middleware to implement role-base access controll
const authorize = (...allowedRoles) => (req, res, next) => tryCatch(() => {
    // check whether there are allowed roles, all or none
    const isAllowed = allowedRoles.includes(req.user.role) || allowedRoles.includes("*");

    // allow to access request route
    if (isAllowed) return next();

    // return back with access denied response
    return res.response(403, "Access denied");
})

export default { authenticate, authorize };