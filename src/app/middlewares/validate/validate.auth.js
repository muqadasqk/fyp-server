import tryCatch from "../../../utils/libs/helper/try.catch.js";
import validator from "../../../utils/libs/validation/validator.js";
import file from "../file.js";

const signupForm = (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        name: {
            required: true,
            string: true,
            min: 3,
            max: 50
        },
        email: {
            required: true,
            email: true,
            unique: { user: "email" }
        },
        phone: {
            phone: true,
            unique: { user: "phone" }
        },
        cnic: {
            required: true,
            number: true,
            digits: 13,
            unique: { user: "cnic" }
        },
        rollNo: {
            rollNo: true,
            unique: { user: "rollNo" }
        },
        role: {
            in: ["supervisor", "student"]
        },
        password: {
            required: true,
            password: true
        },
        image: {
            required: true,
            extension: ["jpg", "jpeg", "png"],
            filesize: 1024 * 3
        },
    });

    // delete uploaded image file once validation was failed
    if (validationFailed && req.body?.image?.name) {
        file.delete(req.body.image.name);
    }

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    // extract and set image value from image.name
    if (req.body?.image?.name) {
        req.body.image = req.body.image.name
    }

    next();
}, res);

const signinForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        username: {
            required: true
        },
        password: {
            required: true
        }
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    next();
}, res);

const resetPasswordForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        password: {
            required: true,
            password: true
        },
        confirmationPassword: {
            required: true,
            same: { password: req.body.password }
        },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    next();
}, res);

const verifyOTPForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        email: {
            required: true,
            email: true
        },
        otp: {
            required: true,
            number: true, digits: 6
        },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    next();
}, res);

const sendOTPForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        email: {
            required: true,
            email: true
        },
        subject: {
            min: 5,
            max: 255
        },
        sendViaWhatsApp: {
            in: [0, 1]
        },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    next();
}, res);

export default { signupForm, signinForm, resetPasswordForm, verifyOTPForm, sendOTPForm };