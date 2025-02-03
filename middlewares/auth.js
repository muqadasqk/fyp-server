import userService from "../app/services/user.service.js";
import env from "../config/env.js";
import httpCode from "../utils/constants/http.code.js";
import status from "../utils/constants/status.js";
import toast from "../utils/constants/toast.js";
import userRole from "../utils/constants/user.role.js";
import { tryCatch, verifyJWT } from "../utils/functions.js";

// middleware to authenticate user using JWT token
const authenticate = (req, res, next) => tryCatch(async () => {
    // verify token from request headers; extract user ID from JWT token payload
    const { userId } = await verifyJWT(req.headers.authorization);

    // check is user ID is admin username; identify request user as an admin
    if (userId == env.admin.username) {
        // add user to request object (for admin)
        req.user = {
            name: env.admin.username,
            role: userRole.ADMIN
        }

        return next();
    };

    // retrieve user by user ID extracted from JWT token payload 
    const user = await userService.retrieveOne({ _id: userId });

    // return back with access denied response whtether user is not found or user status is not active
    if (!user || user.status !== status.ACTIVE) return res.response(httpCode.ACCESS_DENIED, toast.MISC.ACCESS_DENIED);

    // add user to request object
    req.user = user;

    next();
}, res);

// object containing 3 middlewares to check is request user is not admin/supervsor/student
const not = {
    // middleware to ensure the request user is not admin; otherwise return back with access denied response
    admin: (req, res, next) => tryCatch(async () => {
        if (req.user.role === userRole.ADMIN) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }

        next();
    }, res),

    // middleware to ensure the request user is not supervisor; otherwise return back with access denied response
    supervisor: (req, res, next) => tryCatch(async () => {
        if (req.user.role === userRole.SUPERVISOR) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }

        next();
    }, res),

    // middleware to ensure the request user is not student; otherwise return back with access denied response
    student: (req, res, next) => tryCatch(async () => {
        if (req.user.role === userRole.STUDENT) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }

        next();
    }, res),
}

// object containing 3 middlewares to check is request user is admin/supervsor/student
const is = {
    // middleware to ensure the request user is admin; otherwise return back with access denied response
    admin: (req, res, next) => tryCatch(async () => {
        if (req.user.role !== userRole.ADMIN) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }

        next();
    }, res),

    // middleware to ensure the request user is supervisor; otherwise return back with access denied response
    supervisor: (req, res, next) => tryCatch(async () => {
        if (req.user.role !== userRole.SUPERVISOR) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }

        next();
    }, res),

    // middleware to ensure the request user is student; otherwise return back with access denied response
    student: (req, res, next) => tryCatch(async () => {
        if (req.user.role !== userRole.STUDENT) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }

        next();
    }, res),
}

export default { authenticate, not, is };