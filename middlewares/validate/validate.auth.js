import httpCode from "../../utils/constants/http.code.js";
import toast from "../../utils/constants/toast.js";
import userRole from "../../utils/constants/user.role.js";
import { tryCatch } from "../../utils/functions.js";
import validator from "../../utils/validation/validator.js";
import file from "../file.js";

const signupForm = (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        name: { required: true, string: true, min: 3, max: 50 },
        email: { required: true, email: true, unique: { user: 'email' }, min: 6, max: 255 },
        nic: { required: true, number: true, unique: { user: 'nic' }, size: 13 },
        rollNo: { unique: { user: 'rollNo' }, size: 7, regex: /^[0-9]{2}[a-zA-Z]{2}[0-9]{3}$/ },
        role: { in: [userRole.SUPERVISOR, userRole.STUDENT] },
        password: { required: true, password: true },
        image: { required: true, extension: ['jpg', 'jpeg', 'png'], filesize: 3972 },
    });

    // delete uploaded image file once validation was failed
    if (validationFailed && req.body.image.name) {
        file.delete(req.body.image.name);
    }

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    // extract and set image value from image.name
    if (req.body.image.name) {
        req.body.image = req.body.image.name
    }

    next();
}, res);

const signinForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        email: { required: true, email: true },
        password: { required: true }
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    next();
}, res);

const adminSigninForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        username: { required: true, string: true },
        password: { required: true }
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    next();
}, res);

const resetPasswordForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        password: { required: true, password: true },
        confirmationPassword: { required: true, same: { password: req.body.password } },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    next();
}, res);

const verifyOTPForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        email: { required: true, email: true },
        otp: { required: true, size: 6 },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    next();
}, res);

const sendOTPForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        email: { required: true, email: true },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    next();
}, res);

export default { signupForm, signinForm, adminSigninForm, resetPasswordForm, verifyOTPForm, sendOTPForm };