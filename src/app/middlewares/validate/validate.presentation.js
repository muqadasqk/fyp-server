import tryCatch from "../../../utils/libs/helper/try.catch.js";
import validator from "../../../utils/libs/validation/validator.js";
import file from "../file.js";

const createForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        project: {
            required: true,
            mongooseId: true,
            exists: { project: '_id' }
        },
        summary: {
            required: true,
            word: { min: 10, max: 350 }
        },
        fyp: {
            required: true,
            in: ["fyp1", "fyp2", "fyp3", "fypFinal"]
        },
        resource: {
            required: true,
            extension: ['pdf', 'pptx', 'docx', 'zip', 'rar', '7z', 'tar'],
            filesize: 1024 * 10
        },
    });

    // delete uploaded resource once validation was failed
    if (validationFailed && req.body.resource) {
        file.delete(req.body.resource.name);
    }

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    // extract and set resource value from resource.name
    if (req.body.resource && req.body.resource.name) {
        req.body.resource = req.body.resource.name
    }

    next();
}, res);

const updateForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        summary: {
            word: { min: 10, max: 350 }
        },
        resource: {
            extension: ['pdf', 'pptx', 'docx', 'zip', 'rar', '7z', 'tar'],
            filesize: 1024 * 10
        },
        remarks: {
            word: { min: 5, max: 350 }
        },
        status: {
            in: ["reviewed", "rejected", "submitted"]
        },
    });

    // delete uploaded file once validation was failed
    if (validationFailed && req.body.resource) {
        file.delete(req.body.resource.name);
    }

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    // extract and set resource value from resource.name
    if (req.body.resource && req.body.resource.name) {
        req.body.resource = req.body.resource.name
    }

    next();
}, res);

export default { createForm, updateForm };