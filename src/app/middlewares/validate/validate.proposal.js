import tryCatch from "../../../utils/libs/helper/try.catch.js";
import validator from "../../../utils/libs/validation/validator.js";
import httpCode from "../../../utils/constants/http.code.js";
import toast from "../../../utils/constants/toast.js";
import status from '../../../utils/constants/status.js';
import types from '../../../utils/constants/type.js';

const createForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        memberOne: { mongooseId: true, exists: { user: '_id' } },
        memberTwo: { mongooseId: true, exists: { user: '_id' } },
        title: { required: true, min: 3, max: 255, unique: { proposal: 'title' } },
        abstract: { required: true, word: { min: 200, max: 350 } },
        type: { required: true, in: [types.NEW, types.MODIFIED_OR_EXTENSION, types.RESEARCH_BASED] },
        category: { required: true, string: true },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    next();
}, res);

const updateForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        remarks: { word: { min: 5, max: 350 } },
        status: { in: [status.ACCEPTED, status.CONDITIONALLY_ACCEPTED, status.REJECTED] },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    next();
}, res);

export default { createForm, updateForm };