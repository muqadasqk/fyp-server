import tryCatch from "../../../utils/libs/helper/try.catch.js";
import validator from "../../../utils/libs/validation/validator.js";

const createForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        project: {
            required: true,
            mongooseId: true,
            exists: { project: '_id' }
        },
        link: {
            required: true,
            url: true
        },
        schedule: {
            required: true,
            date: { futureDate: true }
        },
        summary: {
            required: true,
            word: { min: 5, max: 350 }
        },
        reference: {
            url: true
        },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    next();
}, res);

const updateForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        link: {
            url: true
        },
        schedule: {
            date: { futureDate: true }
        },
        summary: {
            word: { min: 5, max: 350 }
        },
        link: {
            url: true
        },
        status: {
            match: "completed"
        }
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    next();
}, res);

export default { createForm, updateForm };