import validateMongooseObjectId from "../../utils/libs/database/validate.mongoose.object.id.js";
import buildMongoQuery from "../../utils/libs/database/build.mongo.query.js";
import meetingService from "../services/meeting.service.js";
import tryCatch from "../../utils/libs/helper/try.catch.js";
import httpCode from "../../utils/constants/http.code.js";
import userRole from "../../utils/constants/user.role.js";
import toast from "../../utils/constants/toast.js";
import env from "../../config/env.js";

// RETRIEVE ALL MEETING DOCUMENTS
const index = (req, res) => tryCatch(async () => {
    // retrieve all meeting documents optionally with query and page related with certain limits
    const data = await meetingService.retrieveAll(
        {
            searchQuery: req.query.q ?? '', // query search parameter to filter meeting documents
            currentPage: parseInt(req.query.p ?? 1), // page parameter to retrieve documents ahead of page count
            documentCount: parseInt(req.query.c ?? env.document.count) // count parameter to retrieve certain document count on per page
        },
        {
            requestUser: {
                id: req.user._id ?? req.user.name, // request user role to get its specific meeting documents only
                role: req.user.role, // request user role to differentiate while retrieving its specific meeting documents
            },
        }
    );

    // return back with sucess response containg meeting documents
    return res.response(httpCode.SUCCESS, toast.DATA.ALL('meeting'), data);
}, res);


// RETRIEVE ALL PROJECT RELATED PROGRESSES
const projectMeetings = (req, res) => tryCatch(async () => {
    // vaidate project id
    validateMongooseObjectId(req.params.projectId);

    // retrieve project related progress documents
    const data = await meetingService.retrieveAll(
        {
            searchQuery: req.query.q ?? '', // query search parameter to filter project documents
            currentPage: parseInt(req.query.p ?? 1), // page parameter to retrieve documents ahead of page count
            documentCount: parseInt(req.query.c ?? env.document.count) // rpp (records per-page) parameter to retrieve certain documents per page
        },
        {
            userQuery: buildMongoQuery({
                field: 'project', value: req.params.projectId
            }, { isObjectId: true })
        }
    );

    // return back with success response containg project document
    return res.response(httpCode.SUCCESS, toast.DATA.ALL('project meeting'), data);
}, res);


// RETRIEVE ONE SINGLE MEETING DOCUMENT
const show = (req, res) => tryCatch(async () => {
    // vaidate parameter meeting id
    validateMongooseObjectId(req.params.meetingId);

    // retrieve single specified meeting document
    let meeting = await meetingService.retrieveOne(
        buildMongoQuery({ field: '_id', value: req.params.meetingId })
    );

    // return back with meeting document not found response
    if (!meeting) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('meeting'))

    // return back with success response containg meeting document
    return res.response(httpCode.SUCCESS, toast.DATA.ONE('meeting'), { meeting });
}, res);


// CREATE A NEW MEETING DOCUMENT
const create = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const fields = ['project', 'summary', 'link', 'schedule', 'reference'];

    // extacting only allowed fields from request body
    const data = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => fields.includes(field) && value)
    );

    // create a new meeting document
    const meeting = await meetingService.create(data);

    // return back with failed to create meeting response once failed
    if (!meeting) throw new Error(toast.DATA.FAILED('create', 'meeting'));

    // return back with success response containing newly created meeting document
    return res.response(httpCode.RESOURCE_CREATED, toast.DATA.CREATED('meeting'), { meeting });
}, res);


// UDATE A MEETING DOCUMENT BY ID WHEN REQUEST USER IS ADMIN/SUPERVISOR OTHERWISE BY LEAD/MEMBERONE/MEMBERTWO
const update = (req, res) => tryCatch(async () => {
    // vaidate parameter meeting id
    validateMongooseObjectId(req.params.meetingId);

    // build query for meeting id
    const query = buildMongoQuery({ field: '_id', value: req.params.meetingId });

    // validate meeting project belongs to request supervisor
    if (req.user.role === userRole.SUPERVISOR) {
        // retrieve meeting project supervisor id
        const meeting = await meetingService.retrieveOne(query);

        // return back with meeting document not found response when document is unavailable
        if (!meeting) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('meeting'));

        // return back with access denied response if request supervisor isn't meeting project supervisor
        if (!meeting.project.supervisor?._id.equals(req.user._id)) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }
    }

    // initialize allowed fields array
    const fields = ['summary', 'link', 'schedule', 'reference', 'status'];

    // retrieve only allowed fields from request body
    const changes = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => value && fields.includes(field))
    );

    // update meeting document fields accordingly
    const meeting = await meetingService.update(query, changes);

    // return back with meeting document not found response when document is unavailable
    if (!meeting) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('meeting'));

    // update meeting document with newly updated fields
    Object.assign(meeting, changes);

    // return back with success response containing update meeting document
    return res.response(httpCode.SUCCESS, toast.DATA.UPDATED('meeting'), { meeting });
}, res);


// DELETE MEETING DOCUMENT 
const del = (req, res) => tryCatch(async () => {
    // validate project ID
    validateMongooseObjectId(req.params.meetingId);

    // retrieve meetings document
    const meeting = await meetingService.retrieveOne({ _id: req.params.meetingId });

    // return back with invalid meeting id response; if document is unavailable
    if (!meeting) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('meeting'));

    // validate meeting project belongs to request supervisor
    if (req.user.role !== userRole.ADMIN) {
        // return back with access denied response if request supervisor isn't meeting project supervisor
        if (!meeting.project.supervisor?._id.equals(req.user._id)) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        }
    }

    // attempt to delete single specified meeting document
    await meetingService.delete(req.params.meetingId);

    // return back with success response
    return res.response(httpCode.SUCCESS, toast.DATA.DELETED('meeting'));
}, res);


export default { index, projectMeetings, show, create, update, delete: del }