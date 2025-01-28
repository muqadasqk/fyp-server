import httpCode from "../../utils/constants/http.code.js";
import model from "../../utils/constants/model.js";
import toast from "../../utils/constants/toast.js";
import userRole from "../../utils/constants/user.role.js";
import validator from "../../utils/validation/validator.js";
import file from "../file.js";

const signupForm = async (req, res, next) => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        name: { required: true, string: true, min: 3, max: 50 },
        email: { required: true, email: true, unique: { field: 'email', model: model.USERS }, min: 6, max: 255 },
        nic: { required: true, number: true, unique: { field: 'nic', model: model.USERS }, size: 13 },
        rollNo: { unique: { field: 'rollNo', model: model.USERS }, size: 7 },
        role: { required: true, in: [userRole.SUPERVISOR, userRole.STUDENT] },
        password: { required: true, password: true },
        image: { required: true, extension: ['jpg', 'jpeg', 'png'], filesize: 3072 },
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
};

const signinForm = async (req, res, next) => {
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
};

const adminSigninForm = async (req, res, next) => {
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
};

const resetPasswordForm = async (req, res, next) => {
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
};

const verifyOTPForm = async (req, res, next) => {
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
};

const sendOTPForm = async (req, res, next) => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        email: { required: true, email: true },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    next();
};

export default { signupForm, signinForm, adminSigninForm, resetPasswordForm, verifyOTPForm, sendOTPForm };