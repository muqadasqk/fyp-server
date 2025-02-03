import env from "../../config/env.js";
import httpCode from "../../utils/constants/http.code.js";
import toast from "../../utils/constants/toast.js";
import userRole from "../../utils/constants/user.role.js";
import { objectId, objFields, str, tryCatch, validateMongoObjectID } from "../../utils/functions.js";
import progressService from "../services/progress.service.js";
import projectService from "../services/project.service.js";

// RETRIEVE ALL PROGRESS DOCUMENTS
const index = (req, res) => tryCatch(async () => {
    // retrieve all progress documents optionally with query and page related with certain limits
    const data = await progressService.retrieveAll(
        {
            userID: req.user._id ?? req.user.name, // request user role to get its specific progress documents only
            userRole: req.user.role, // request user role to differentiate while retrieving its specific progress documents
        },
        {
            query: req.query.q ?? '', // query search parameter to filter progress documents
            page: parseInt(req.query.p ?? 1), // page parameter to retrieve documents ahead of page count
            limit: parseInt(req.query.rpp ?? env.documents.perpage), // rpp (records per-page) parameter to retrieve certain documents per page
        }
    );

    // return back with sucess response containg progress documents
    return res.response(httpCode.SUCCESS, toast.DATA.ALL('progress'), data);
}, res);


// RETRIEVE ONE SINGLE PROGRESS DOCUMENT
const show = (req, res) => tryCatch(async () => {
    // vaidate is parameter ID is valid mongooseID
    validateMongoObjectID(req.params.progressId);

    // retrieve single specified progress document
    let progress = await progressService.retrieveOne({ _id: objectId(req.params.progressId) });

    // return back with progress document not found response
    if (!progress) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('progress'))

    // return back with success response containg progress document
    return res.response(httpCode.SUCCESS, toast.DATA.ONE('progress'), { progress });
}, res);


// CREATE A NEW PROGRES DOCUMENT
const create = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const fields = ['project', 'summary', 'session', 'resource'];

    // extacting only allowed fields from request body
    const data = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => fields.includes(field) && value)
    );

    // initialize project document
    let progress = {};

    // create query to retrieve progress document
    const query = { project: objectId(data.project), session: data.session };

    // update progress document if exists
    if (await progressService.retrieveOne(query)) {
        // update existing progress document
        progress = await progressService.update(query, data);

        // update progress document to show updated resource file
        progress.resource = data.resource;
    } else {
        // create a new progress document
        progress = await progressService.create(data);
    }

    // return back with failed to create progress response once failed
    if (!progress) throw new Error(toast.DATA.FAILED('create', 'progress'));

    // return back with success response containing newly created progress document
    return res.response(httpCode.RESOURCE_CREATED, toast.DATA.CREATED('progress'), { progress });
}, res);


// UDATE A PROGRESS DOCUMENT BY ID WHEN REQUEST USER IS ADMIN/SUPERVISOR OTHERWISE BY LEAD/MEMBERONE/MEMBERTWO
const update = (req, res) => tryCatch(async () => {
    // validate progress is valid mongoose ID
    validateMongoObjectID(req.params.progressId);

    // retrieve specified progress document
    let progress = await progressService.retrieveOne({ _id: objectId(req.params.progressId) });

    // return back with progress document not found response when document is unavailable
    if (!progress) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('progress'));

    // retrive project document
    let project = await projectService.retrieveOne({ _id: progress.project });

    // return back with project document not found response when document is unavailable
    if (!project) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('project'));

    // initialize allowed fields array
    let fields = [];

    // if the request user is lead/memberOne|Two
    if (req.user.role === userRole.STUDENT) {
        // retrieve progress project lead/memberOne|Two IDs
        const referenceUsers = objFields.only(project, ['lead', 'memberOne', 'memberTwo'], { mongooseObject: true });

        // return back with access denied response when request user is not one of them (lead/memberOne|Two)
        if (!Object.values(referenceUsers).map(referenceUser => referenceUser && referenceUser._id).some(referrenceId => str.compare(referrenceId, req.user._id))) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }

        // add-on in allowed fields for progress project lead/memberOne|Two
        fields.push('summary', 'resource');
    }

    // if the request user is supervisor
    if (req.user.role === userRole.SUPERVISOR) {
        // return back with access denied response when request user is not progress supervisor
        if (!project.supervisor || !str.compare(progress.supervisor._id, req.user._id)) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }

        // add-on in allowed fields for progress project supervisor
        fields.push('remarks', 'status');
    }

    // it request user is admin add-on 
    if (req.user.role === userRole.ADMIN) {
        fields.push('summary', 'resource', 'remarks', 'status');
    }

    // retrieve only allowed fields from request body
    const changes = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => value && fields.includes(field))
    );

    // update progress document fields accordingly
    progress = await progressService.update({ _id: progress._id }, changes);

    // return back with progress document not found response when document is unavailable
    if (!progress) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('progress'));

    // update progress document with newly updated fields
    Object.assign(progress, changes);

    // return back with success response containing update progress document
    return res.response(httpCode.SUCCESS, toast.DATA.UPDATED('progress'), { progress });
}, res);


// DELETE PROGRESS DOCUMENT 
const del = (req, res) => tryCatch(async () => {
    // validate project ID
    validateMongoObjectID(req.params.progressId);

    // retrieve progress document ID
    const progress = await progressService.retrieveOne({ _id: req.params.progressId });

    // return back with progress document not found response when document is unavailable
    if (!progress) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('progress'));

    // if requet user is student
    if (req.user.role === userRole.STUDENT) {
        // retrieve request user related project document when lead
        const project = await projectService.retrieveOne({ _id: progress.project });

        // 'return back with access denied response; if project document is unavailable or request user is not lead
        if (!project || !str.compare(project.lead?._id, req.user._id)) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }
    }

    // attempt to delete single specified progress document
    await progressService.delete(progress._id);

    // return back with success response
    return res.response(httpCode.SUCCESS, toast.DATA.DELETED('progress'));
}, res);


export default { index, show, create, update, delete: del }