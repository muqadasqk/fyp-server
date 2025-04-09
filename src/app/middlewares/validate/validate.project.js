import tryCatch from "../../../utils/libs/helper/try.catch.js";
import validator from "../../../utils/libs/validation/validator.js";
import file from "../file.js";

const createForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        lead: {
            required: true,
            mongooseId: true,
            exclude: [req.body?.memberOne, req.body?.memberTwo, req.body?.supervisor],
            exists: { user: '_id' },
        },
        memberOne: {
            mongooseId: true,
            exclude: [req.body?.lead, req.body?.memberTwo, req.body?.supervisor],
            exists: { user: '_id' },
        },
        memberTwo: {
            mongooseId: true,
            exclude: [req.body?.lead, req.body?.memberOne, req.body?.supervisor],
            exists: { user: '_id' },
        },
        supervisor: {
            required: true,
            mongooseId: true,
            exclude: [req.body?.lead, req.body?.memberOne, req.body?.memberTwo],
            exists: { user: '_id' },
        },
        pid: {
            required: true, pid: true
        },
        title: {
            required: true,
            min: 3,
            max: 255,
            unique: { project: 'title' }
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
        lead: {
            mongooseId: true,
            exclude: [req.body?.memberOne, req.body?.memberTwo, req.body?.supervisor],
            exists: { user: '_id' },
        },
        memberOne: {
            mongooseId: true,
            exclude: [req.body?.lead, req.body?.memberTwo, req.body?.supervisor],
            exists: { user: '_id' },
        },
        memberTwo: {
            mongooseId: true,
            exclude: [req.body?.lead, req.body?.memberOne, req.body?.supervisor],
            exists: { user: '_id' },
        },
        supervisor: {
            mongooseId: true,
            exclude: [req.body?.lead, req.body?.memberOne, req.body?.memberTwo],
            exists: { user: '_id' },
        },
        title: {
            string: true,
            min: 3,
            max: 255,
            unique: { project: 'title', skip: { _id: req.params.projectId } }
        },
        abstract: {
            required: true,
            word: { min: 200, max: 350 }
        },
        proposal: {
            extension: ['pdf', 'docx', 'pptx'],
            filesize: 10240
        },
        type: {
            required: true,
            in: ["new", "modifiedOrExtension", "researchBased"]
        },
        category: {
            required: true,
            string: true
        },
        status: {
            match: "completed"
        },
    });

    // delete uploaded proposal file once validation was failed
    if (validationFailed && req.body.proposal) {
        file.delete(req.body.proposal.name);
    }

    // send response of validation failure
    if (validationFailed) {
        return res.response(422, "There was a validation failure", { errors });
    }

    // extract and set proposal value from proposal.name
    if (req.body.proposal && req.body.proposal.name) {
        req.body.proposal = req.body.proposal.name
    }

    next();
}, res);

export default { createForm, updateForm };