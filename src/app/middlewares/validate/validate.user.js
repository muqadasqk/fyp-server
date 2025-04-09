import tryCatch from "../../../utils/libs/helper/try.catch.js";
import validator from "../../../utils/libs/validation/validator.js";
import file from "../file.js";

const createForm = (req, res, next) => tryCatch(async () => {
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
            number: true,
            digits: 13,
            unique: { user: "cnic" }
        },
        rollNo: {
            size: 7,
            rollNo: true,
            unique: { user: "rollNo" }
        },
        role: {
            in: ["supervisor", "student"]
        },
        image: {
            extension: ["jpg", "jpeg", "png"],
            filesize: 1024 * 3
        },
    });

    // delete uploaded image file once validation was failed
    if (validationFailed && req.body.image.name) {
        file.delete(req.body.image.name);
    }

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    // extract and set image value from image.name
    if (req.body.image.name) {
        req.body.image = req.body.image.name
    }

    next();
}, res);


const updateForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        name: {
            string: true,
            min: 3,
            max: 50
        },
        email: {
            email: true,
            unique: { user: 'email', skip: { _id: req.user._id } }
        },
        phone: {
            phone: true,
            unique: { user: 'phone', skip: { _id: req.user.id } }
        },
        image: {
            extension: ['jpg', 'jpeg', 'png'],
            filesize: 1024 * 3
        },
    });

    // delete uploaded image file once validation was failed
    if (validationFailed && req.body.image) {
        file.delete(req.body.image.name);
    }

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    // extract and set image value from image.name
    if (req.body.image && req.body.image.name) {
        req.body.image = req.body.image.name
    }

    next();
}, res);


const updatePasswordForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        currentPassword: {
            required: true
        },
        password: {
            required: true,
            password: true
        },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    next();
}, res);

const updateStatusForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        statusCode: {
            required: true,
            number: true,
            digits: 5,
            in: ["20001", "20002", "20003", "20004"]
        },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    next();
}, res);

export default { createForm, updateForm, updatePasswordForm, updateStatusForm };