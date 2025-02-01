import env from "../../config/env.js";
import httpCode from "../../utils/constants/http.code.js";
import toast from "../../utils/constants/toast.js";
import userRole from "../../utils/constants/user.role.js";
import { createFilter, objFields, str, tryCatch, validateMongoObjectID } from "../../utils/functions.js";
import projectService from "../services/project.service.js"

// RETRIEVE ALL PROJECT DOCUMENTS
const all = (req, res) => tryCatch(async () => {
    // retrieve all project documents optionally with query and page related with certain limits
    const data = await projectService.all({
        query: req.query.q ?? '',
        page: parseInt(req.query.page ?? 1),
        limit: parseInt(req.query.limit ?? env.documents.perpage)
    });

    // return back with sucess response containg project documents
    return res.response(httpCode.SUCCESS, toast.DATA.ALL('project'), { ...data });
}, res);

// RETRIEVE ONE SINGLE PRJECT DOCUMENT
const one = (req, res) => tryCatch(async () => {
    // vaidate is parameter ID is valid mongooseID
    validateMongoObjectID(req.params.projectId);

    // build query to retrieve project document matching _id/lead/memberOne|Two/supervisor
    const query = createFilter(req.params.projectId, ['_id', 'supervisor', 'lead', 'memberOne', 'memberTwo'], {
        mongooseId: true
    });

    // retrieve single specified project document
    let project = await projectService.one(query);

    // return back with project document not found response
    if (!project) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('project'))

    // return back with success response containg project document
    return res.response(httpCode.SUCCESS, toast.DATA.ONE('project'), { project });
}, res);

// CREATE A NEW PROJECT DOCUMENT
const create = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const fields = ['title', 'memberOne', 'memberTwo', 'abstract', 'proposal'];

    // extacting only allowed fields from request body
    const data = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => fields.includes(field) && value)
    );

    // set project lead user ID
    data.lead = req.user._id;

    // attempt to create a new project document; throw failed to create error if unsuccessful
    const project = await projectService.create(data);
    if (!project) throw new Error(toast.DATA.FAILED('create', 'project'));

    // return back with success response containing newly created project document
    return res.response(httpCode.RESOURCE_CREATED, toast.DATA.CREATED('project'), { project });
}, res);

// UDATE A PROJECT DOCUMENT BY ID WHEN REQUEST USER IS ADMIN/SUPERVISOR OTHERWISE BY LEAD/MEMBERONE/MEMBERTWO
const update = (req, res) => tryCatch(async () => {
    // validate project is valid mongoose ID
    validateMongoObjectID(req.params.projectId);

    // retrieve specified project document
    let project = await projectService.one({ _id: req.params.projectId });

    // return back with project document not found response when document is unavailable
    if (!project) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('project'));

    // fields allowed that can be replaced/null
    const referrenceFields = ['lead', 'memberOne', 'memberTwo'];

    // initialize allowed fields array
    let fields = [];

    // if the request user is lead/memberOne|Two
    if (req.user.role === userRole.STUDENT) {
        // retrieve student referrence IDs
        const referrenceIds = objFields.only(project, referrenceFields, { mongooseObject: true });

        // find match whether the request user is one of them project lead/memberOne|Two
        const requestUser = Object.keys(referrenceIds).find(field => referrenceIds[field] && str.compare(referrenceIds[field]._id, req.user._id));

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
        // add-on in allowed fields for project supervisor
        fields.push('title', 'abstract', 'proposal', 'lead', 'memberOne', 'memberTwo', 'status', 'remarks');

        // return back with access denied response when request user is not project supervisor
        if (!project.supervisor || !str.compare(project.supervisor._id, req.user._id)) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }
    }

    // it request user is admin add-on 
    if (req.user.role === userRole.ADMIN) {
        fields.push('title', 'abstract', 'proposal', 'lead', 'memberOne', 'memberTwo', 'status', 'remarks', 'supervisor');
        referrenceFields.push('supervisor');
    }

    // retrieve only allowed fields from request body
    const changes = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => {
            return (value && fields.includes(field)) || (!value && referrenceFields.includes(field));
        })
    );

    // allow lead/memberOne|two and supervisor to be completely removed or replaced
    referrenceFields.map(field => {
        if (objFields.available(changes, field, { null: true })) {
            changes[field] = null;
        };
    });

    // update project document fields accordingly
    project = await projectService.update({ _id: project._id }, changes);

    // return back with project document not found response when document is unavailable
    if (!project) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('project'));

    // retrieve updated project document
    project = await projectService.one({ _id: project._id });

    // return back with success response containing update project document
    return res.response(httpCode.SUCCESS, toast.DATA.UPDATED('project'), { project });
}, res);

// DELETE RROJECT DOCUMENT 
const del = (req, res) => tryCatch(async () => {
    // attempt to delete single specified project document
    const project = await projectService.delete(req.params.projectId);

    // return back with project document not found response when document is unavailable
    if (!project) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('project'))

    // return back with success response
    return res.response(httpCode.SUCCESS, toast.DATA.DELETED('project'));
}, res);

export default { all, one, create, update, delete: del }