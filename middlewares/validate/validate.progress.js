import validator from '../../utils/validation/validator.js';
import status from '../../utils/constants/status.js';
import httpCode from '../../utils/constants/http.code.js';
import toast from '../../utils/constants/toast.js';
import file from '../file.js';
import session from '../../utils/constants/session.js';
import { tryCatch } from '../../utils/functions.js';

const createForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        project: { required: true, mongooseId: true, exists: { project: '_id' } },
        summary: { required: true, word: { min: 10, max: 350 } },
        session: { required: true, in: [session.ONE, session.TWO, session.THREEE, session.FINAL] },
        resource: { required: true, filesize: 102400, extension: ['pdf', 'docx', 'zip', 'rar', '7z', 'tar'] },
    });

    // delete uploaded resource once validation was failed
    if (validationFailed && req.body.resource) {
        file.delete(req.body.resource.name);
    }

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    // extract and set resource value from resource.name
    if (req.body.resource && req.body.resource.name) {
        req.body.resource = req.body.resource.name
    }

    next();
}, res);

const updateForm = async (req, res, next) => tryCatch(async () => {
    // validate fields against rules
    const { validationFailed, errors } = await validator(req.body, {
        summary: { word: { min: 10, max: 350 } },
        resource: { filesize: 102400, extension: ['pdf', 'docx', 'zip', 'rar', '7z', 'tar'] },
        remarks: { word: { min: 5, max: 350 } },
        status: { in: [status.REVIEWED, status.REJECTED, status.SUBMITTED] },
    });

    // delete uploaded file once validation was failed
    if (validationFailed && req.body.resource) {
        file.delete(req.body.resource.name);
    }

    // send response of validation failure
    if (validationFailed) {
        return res.response(httpCode.INVALID_DATA, toast.VALIDATION.FAILS, { errors });
    }

    // extract and set resource value from resource.name
    if (req.body.resource && req.body.resource.name) {
        req.body.resource = req.body.resource.name
    }

    next();
}, res);

export default { createForm, updateForm };