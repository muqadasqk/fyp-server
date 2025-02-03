import env from "../../config/env.js";
import file from "../../middlewares/file.js";
import httpCode from "../../utils/constants/http.code.js";
import status from "../../utils/constants/status.js";
import toast from "../../utils/constants/toast.js";
import userRole from "../../utils/constants/user.role.js";
import { createFilter, objectId, objFields, str, tryCatch, validateMongoObjectID } from "../../utils/functions.js";
import projectService from "../services/project.service.js"

// RETRIEVE ALL PROJECT DOCUMENTS
const index = (req, res) => tryCatch(async () => {
    // retrieve all project documents optionally with query and page related with certain limits
    const data = await projectService.retrieveAll({
        query: req.query.q ?? '', // query search parameter to filter project documents
        page: parseInt(req.query.p ?? 1), // page parameter to retrieve documents ahead of page count
        limit: parseInt(req.query.rpp ?? env.documents.perpage) // rpp (records per-page) parameter to retrieve certain documents per page
    });

    // return back with sucess response containg project documents
    return res.response(httpCode.SUCCESS, toast.DATA.ALL('project'), data);
}, res);


// RETRIEVE ONE SINGLE PROJECT DOCUMENT
const show = (req, res) => tryCatch(async () => {
    // vaidate is parameter ID is valid mongooseID
    validateMongoObjectID(req.params.projectId);

    // build query to retrieve project document matching _id/lead/memberOne|Two
    const query = createFilter(req.params.projectId, ['_id', 'lead', 'memberOne', 'memberTwo'], {
        mongooseId: true
    });

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
    const query = reference => ({
        $or: [
            { memberOne: objectId(data[reference]) },
            { memberTwo: objectId(data[reference]) },
        ]
    });

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
    // validate project is valid mongoose ID
    validateMongoObjectID(req.params.projectId);

    // retrieve specified project document
    let project = await projectService.retrieveOne({ _id: objectId(req.params.projectId) });

    // return back with project document not found response when document is unavailable
    if (!project) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('project'));

    // fields allowed that can be replaced/null
    const referenceFields = ['lead', 'memberOne', 'memberTwo'];

    // initialize allowed fields array
    let fields = [];

    // if the request user is lead/memberOne|Two
    if (req.user.role === userRole.STUDENT) {
        // retrieve student reference IDs
        const referenceIds = objFields.only(project, referenceFields, { mongooseObject: true });

        // find match whether the request user is one of them project lead/memberOne|Two
        const requestUser = Object.keys(referenceIds).find(field => referenceIds[field] && str.compare(referenceIds[field]._id, req.user._id));

        // return back with access denied response when request user is not one of them (lead/memberOne|Two)
        if (!requestUser) return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);

        // add-on in allowed fields for lead/memberOne|Two
        fields.push('title', 'abstract', 'proposal');

        // let project lead to add/remoce memberOne|Two
        if (requestUser === 'lead') {
            fields.push('memberOne', 'memberTwo');
        }
    }

    // if the request user is supervisor
    if (req.user.role === userRole.SUPERVISOR) {
        // return back with access denied response when request user is not project supervisor
        if (!project.supervisor || !str.compare(project.supervisor._id, req.user._id)) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }

        // add-on in allowed fields for project supervisor
        fields.push('lead', 'memberOne', 'memberTwo', 'status', 'remarks');
    }

    // it request user is admin add-on 
    if (req.user.role === userRole.ADMIN) {
        fields.push('lead', 'memberOne', 'memberTwo', 'status', 'remarks', 'supervisor');
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
        if (objFields.available(changes, field, { null: true })) {
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
    validateMongoObjectID(req.params.projectId);

    // if requet user is student
    if (req.user.role === userRole.STUDENT) {
        // retrieve request user related project document when lead
        const project = await projectService.retrieveOne({ lead: req.user._id });
        console.log('triggering...', project._id, req.params.projectId);

        // 'return back with access denied response; if project document not found
        if (!project || !str.compare(project._id, req.params.projectId)) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }
    }

    // attempt to delete single specified project document
    const project = await projectService.delete(req.params.projectId);

    // return back with project document not found response when document is unavailable
    if (!project) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('project'))

    // return back with success response
    return res.response(httpCode.SUCCESS, toast.DATA.DELETED('project'));
}, res);


export default { index, show, create, update, delete: del }