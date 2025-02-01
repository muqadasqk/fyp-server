import validator from '../../utils/validation/validator.js';
import status from '../../utils/constants/status.js';
import httpCode from '../../utils/constants/http.code.js';
import toast from '../../utils/constants/toast.js';
import file from '../file.js';
import { tryCatch } from '../../utils/functions.js';
import userRole from '../../utils/constants/user.role.js';

const createForm = (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        name: { required: true, string: true, min: 3, max: 50 },
        email: { required: true, email: true, unique: { user: 'email' }, min: 6, max: 255 },
        nic: { number: true, unique: { user: 'nic' }, size: 13 },
        rollNo: { unique: { user: 'rollNo' }, size: 7, regex: /^[0-9]{2}[a-zA-Z]{2}[0-9]{3}$/ },
        role: { in: [userRole.SUPERVISOR, userRole.STUDENT] },
        image: { extension: ['jpg', 'jpeg', 'png'], filesize: 3072 },
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


const updateForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        name: { string: true, min: 3, max: 50 },
        status: { in: [status.ACTIVE, status.INACTIVE] },
        image: { filesize: 3072, extension: ['jpg', 'jpeg', 'png'] },
    });

    // delete uploaded image file once validation was failed
    if (validationFailed && req.body.image) {
        file.delete(req.body.image.name);
    }

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    // extract and set image value from image.name
    if (req.body.image && req.body.image.name) {
        req.body.image = req.body.image.name
    }

    next();
}, res);

const updatePasswordForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        oldPassword: { required: true },
        password: { required: true, password: true },
        confirmationPassword: { required: true, same: { password: req.body.password } },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    next();
}, res);

export default { createForm, updateForm, updatePasswordForm };