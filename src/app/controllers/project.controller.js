import validateMongooseObjectId from "../../utils/libs/database/validate.mongoose.object.id.js";
import buildMongoQuery from "../../utils/libs/database/build.mongo.query.js";
import tryCatch from "../../utils/libs/helper/try.catch.js";
import projectService from "../services/project.service.js";
import httpCode from "../../utils/constants/http.code.js";
import userRole from "../../utils/constants/user.role.js";
import status from "../../utils/constants/status.js";
import toast from "../../utils/constants/toast.js";
import file from "../../middlewares/file.js";
import env from "../../config/env.js";

// RETRIEVE ALL PROJECT DOCUMENTS
const index = (req, res) => tryCatch(async () => {
    // retrieve all project documents optionally with query and page related with certain limits
    const data = await projectService.retrieveAll(
        {
            id: req.user._id ?? req.user.name, // request user role to get its specific project documents only
            role: req.user.role, // request user role to differentiate while retrieving its specific project documents
        },
        {
            searchQuery: req.query.q ?? '', // query search parameter to filter project documents
            currentPage: parseInt(req.query.p ?? 1), // page parameter to retrieve documents ahead of page count
            documentCount: parseInt(req.query.c ?? env.document.count) // rpp (records per-page) parameter to retrieve certain documents per page
        }
    );

    // return back with sucess response containg project documents
    return res.response(httpCode.SUCCESS, toast.DATA.ALL('project'), data);
}, res);


// RETRIEVE ONE SINGLE PROJECT DOCUMENT
const show = (req, res) => tryCatch(async () => {
    // vaidate parameter project id
    validateMongooseObjectId(req.params.projectId);

    // build query to retrieve project document matching _id/lead/memberOne|Two
    const query = buildMongoQuery({
        fields: ['_id', 'lead', 'memberOne', 'memberTwo'],
        value: req.params.projectId
    }, { isObjectId: true })

    // retrieve single specified project document
    let project = await projectService.retrieveOne(query);

    // return back with project document not found response
    if (!project) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('project'))

    // return back with success response containg project document
    return res.response(httpCode.SUCCESS, toast.DATA.ONE('project'), { project });
}, res);


// CREATE A NEW PROJECT DOCUMENT
const create = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const fields = ['title', 'memberOne', 'memberTwo', 'abstract'];

    // return back with forbidden request response when project found for lead
    if (await projectService.retrieveOne({ lead: req.user._id })) {
        return res.response(httpCode.ACCESS_DENIED, toast.PROJECT.ASSIGNED('you'));
    }

    // extacting only allowed fields from request body
    const data = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => fields.includes(field) && value)
    );

    // query to match any project related with memberOne|Two
    const query = (reference) => buildMongoQuery({
        fields: ['memberOne', 'memberTwo'],
        value: data[reference]
    }, { isObjectId: true });

    // return back with forbidden request response when project found for memberOne
    if (data.memberOne && await projectService.retrieveOne(query('memberOne'))) {
        return res.response(httpCode.ACCESS_DENIED, toast.PROJECT.ASSIGNED('member one'));
    }

    // return back with forbidden request response when project found for memberOne
    if (data.memberTwo && (await projectService.retrieveOne(query('memberTwo')))) {
        return res.response(httpCode.ACCESS_DENIED, toast.PROJECT.ASSIGNED('member two'));
    }

    // attempt to create a new project document; throw failed to create error if unsuccessful
    const project = await projectService.create({ ...data, lead: req.user._id });
    if (!project) throw new Error(toast.DATA.FAILED('create', 'project'));

    // return back with success response containing newly created project document
    return res.response(httpCode.RESOURCE_CREATED, toast.DATA.CREATED('project'), { project });
}, res);


// UDATE A PROJECT DOCUMENT BY ID WHEN REQUEST USER IS ADMIN/SUPERVISOR OTHERWISE BY LEAD/MEMBERONE/MEMBERTWO
const update = (req, res) => tryCatch(async () => {
    // vaidate parameter project id
    validateMongooseObjectId(req.params.projectId);

    // retrieve specified project document
    let project = await projectService.retrieveOne(
        buildMongoQuery({ field: '_id', value: req.params.projectId })
    );

    // return back with project document not found response when document is unavailable
    if (!project) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('project'));

    // fields allowed that can be replaced/null
    const referenceFields = ['lead', 'memberOne', 'memberTwo'];

    // initialize allowed fields array
    let fields = [];

    // if the request user is lead/memberOne|Two
    if (req.user.role === userRole.STUDENT) {
        // retrieve student reference IDs
        const references = project.only(referenceFields, true);

        // find match whether the request user is one of them project lead/memberOne|Two
        const requestUser = Object.keys(references).find((field) => {
            return references[field] && references[field]._id.equals(req.user._id);
        });

        // return back with access denied response when request user is not one of them (lead/memberOne|Two)
        if (!requestUser) return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);

        // set allowed fields for lead/memberOne|Two
        fields = ['title', 'abstract', 'proposal'];

        // let project lead to add/remoce memberOne|Two
        if (requestUser === 'lead') {
            fields.push('memberOne', 'memberTwo');
        }
    }

    // if the request user is supervisor
    if (req.user.role === userRole.SUPERVISOR) {
        // return back with access denied response when request user is not project supervisor
        if (!project.supervisor || !project.supervisor._id.equals(req.user._id)) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }

        // set allowed fields for project supervisor
        fields = ['lead', 'memberOne', 'memberTwo', 'status', 'remarks'];
    }

    // it request user is admin add-on 
    if (req.user.role === userRole.ADMIN) {
        // set allowed fields for project supervisor
        fields = ['lead', 'memberOne', 'memberTwo', 'status', 'remarks', 'supervisor'];

        referenceFields.push('supervisor');
    }

    // retrieve only allowed fields from request body
    const changes = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => {
            return (value && fields.includes(field)) || (!value && referenceFields.includes(field));
        })
    );

    // allow lead/memberOne|two and supervisor to be completely removed or replaced
    referenceFields.map(field => {
        if (changes.available(field, true)) {
            changes[field] = null;
        };
    });

    // return back with invalid request if update includes proposal file and project status is not accepted
    if (changes.proposal && project.status !== status.ACCEPTED) {
        file.delete(changes.proposal);
        return res.response(httpCode.INVALID_REQUEST, toast.PROJECT.PROPOSAL_NOT_ALLOWED);
    }

    // return back with invalid request if update includes supervisor ID and project status is not accepted
    if (changes.supervisor && (changes?.status !== status.ACCEPTED || project.status !== status.ACCEPTED)) {
        return res.response(httpCode.INVALID_REQUEST, toast.PROJECT.SUPERVISOR_NOT_ALLOWED);
    }

    // update project document fields accordingly
    await projectService.update({ _id: project._id }, changes);

    // retrieve updated project document
    project = await projectService.retrieveOne({ _id: project._id });

    // return back with success response containing update project document
    return res.response(httpCode.SUCCESS, toast.DATA.UPDATED('project'), { project });
}, res);


// DELETE PROJECT DOCUMENT 
const del = (req, res) => tryCatch(async () => {
    // validate project ID
    validateMongooseObjectId(req.params.projectId);

    // if requet user is student
    if (req.user.role === userRole.STUDENT) {
        // retrieve request user related project document when lead
        const project = await projectService.retrieveOne({ lead: req.user._id });

        // 'return back with access denied response; if project document not found
        if (!project || String(project._id).equals(req.params.projectId)) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }
    }

    // attempt to delete single specified project document
    const project = await projectService.delete(req.params.projectId);

    // return back with project document not found response when document is unavailable
    if (!project) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('project'));

    // return back with success response
    return res.response(httpCode.SUCCESS, toast.DATA.DELETED('project'));
}, res);


export default { index, show, create, update, delete: del }