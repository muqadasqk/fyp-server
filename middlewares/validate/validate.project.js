import validator from '../../utils/validation/validator.js';
import status from '../../utils/constants/status.js';
import httpCode from '../../utils/constants/http.code.js';
import toast from '../../utils/constants/toast.js';
import file from '../file.js';
import { tryCatch } from '../../utils/functions.js';

const createForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        title: { required: true, string: true, min: 3, max: 255, unique: { project: 'title' } },
        memberOne: { mongooseId: true, exists: { user: '_id' } },
        memberTwo: { mongooseId: true, exists: { user: '_id' } },
        abstract: { required: true, word: { min: 200, max: 350 } },
        proposal: { filesize: 10240, extension: ['pdf', 'docx', 'pptx'] },
    });

    // delete uploaded proposal once validation was failed
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

const updateForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        title: { string: true, min: 3, max: 255, unique: { project: 'title', except: { _id: req.params.projectId } } },
        lead: { mongooseId: true, exists: { user: '_id', } },
        memberOne: { mongooseId: true, exists: { user: '_id', } },
        memberTwo: { mongooseId: true, exists: { user: '_id', } },
        supervisor: { mongooseId: true, exists: { user: '_id', } },
        status: { in: [status.PROJECT, status.ACCEPTED, status.CONDITIONALLY_ACCEPTED, status.REJECTED, status.PENDING] },
        file: { filesize: 1024 * 10, extension: ['pdf', 'docx', 'pptx'] },
    });

    // delete uploaded file once validation was failed
    if (validationFailed && req.body.file) {
        file.delete(req.body.file.name);
    }

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    next();
}, res);

export default { createForm, updateForm };