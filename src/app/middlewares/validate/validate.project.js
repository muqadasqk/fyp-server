import tryCatch from "../../../utils/libs/helper/try.catch.js";
import validator from "../../../utils/libs/validation/validator.js";
import httpCode from "../../../utils/constants/http.code.js";
import toast from "../../../utils/constants/toast.js";
import status from '../../../utils/constants/status.js';
import types from "../../../utils/constants/type.js";
import file from "../file.js";

const createForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { errors, validationFailed } = await validator(req.body, {
        lead: { mongooseId: true, exists: { user: '_id' } },
        memberOne: { mongooseId: true, exists: { user: '_id' } },
        memberTwo: { mongooseId: true, exists: { user: '_id' } },
        supervisor: { mongooseId: true, exists: { user: '_id' } },
        pid: { required: true, pid: true },
        title: { required: true, min: 3, max: 255, unique: { project: 'title' } },
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
        lead: { mongooseId: true, exists: { user: '_id', } },
        memberOne: { mongooseId: true, exists: { user: '_id', } },
        memberTwo: { mongooseId: true, exists: { user: '_id', } },
        supervisor: { mongooseId: true, exists: { user: '_id', } },
        title: { string: true, min: 3, max: 255, unique: { project: 'title', skip: { _id: req.params.projectId } } },
        abstract: { required: true, word: { min: 200, max: 350 } },
        proposal: { extension: ['pdf', 'docx', 'pptx'], filesize: 10240 },
        type: { required: true, in: [types.NEW, types.MODIFIED_OR_EXTENSION, types.RESEARCH_BASED] },
        category: { required: true, string: true },
        status: { match: status.COMPLETED },
    });

    // delete uploaded proposal file once validation was failed
    if (validationFailed && req.body.proposal) {
        file.delete(req.body.proposal.name);
    }

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    // extract and set proposal value from proposal.name
    if (req.body.proposal && req.body.proposal.name) {
        req.body.proposal = req.body.proposal.name
    }

    next();
}, res);

export default { createForm, updateForm };