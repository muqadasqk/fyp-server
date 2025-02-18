import tryCatch from "../../utils/libs/helper/try.catch.js";
import validator from "../../utils/libs/validation/validator.js";
import httpCode from "../../utils/constants/http.code.js";
import toast from "../../utils/constants/toast.js";
import status from '../../utils/constants/status.js';
import fyp from '../../utils/constants/fyp.js';
import file from "../file.js";

const createForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        project: { required: true, mongooseId: true, exists: { project: '_id' } },
        link: { required: true, url: true },
        schedule: { required: true, date: { futureDate: true } },
        summary: { required: true, word: { min: 5, max: 350 } },
        reference: { url: true },
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
        link: { url: true },
        schedule: { date: { futureDate: true } },
        summary: { word: { min: 5, max: 350 } },
        link: { url: true },
        status: { match: status.COMPLETED }
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    next();
}, res);

export default { createForm, updateForm };