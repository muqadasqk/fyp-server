import tryCatch from "../../../utils/libs/helper/try.catch.js";
import validator from "../../../utils/libs/validation/validator.js";

const createForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        memberOne: {
            mongooseId: true,
            exclude: [req.user.id, req.body?.memberTwo],
            exists: { user: '_id' }
        },
        memberTwo: {
            mongooseId: true,
            exclude: [req.user.id, req.body?.memberOne],
            exists: { user: '_id' }
        },
        title: {
            required: true,
            min: 3,
            max: 255,
            unique: { proposal: 'title' }
        },
        abstract: {
            required: true,
            word: { min: 200, max: 350 }
        },
        type: {
            required: true,
            in: ["new", "modifiedOrExtension", "researchBased"]
        },
        category: {
            required: true,
            string: true
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
        supervisor: {
            mongooseId: true,
            exists: { user: '_id' }
        },
        remarks: {
            word: { min: 5, max: 350 }
        },
        statusCode: {
            in: [20001, 20002, 20003]
        },
    });

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    next();
}, res);

export default { createForm, updateForm };