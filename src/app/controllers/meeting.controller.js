import validateMongooseObjectId from "../../utils/libs/database/validate.mongoose.object.id.js";
import meetingService from "../services/meeting.service.js";
import tryCatch from "../../utils/libs/helper/try.catch.js";
import filterRequestBody from "../../utils/libs/helper/filter.request.body.js";

// RETRIEVE ALL MEETING DOCUMENTS
const index = (req, res) => tryCatch(async () => {
    // retrieve project documents
    const data = await meetingService.retrieveAll(req.user, req.body.page ?? {});

    // return back with success response containing meeting documents
    return res.response(200, "All meeting records", data);
}, res);


// RETRIEVE ALL PROJECT RELATED PROGRESSES
const projectMeetings = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { projectId } = req.params;

    // vaidate project id
    validateMongooseObjectId(projectId);

    // retrieve project documents
    const data = await meetingService.retrieveMany(projectId, req.body.page ?? {});

    // return back with success response containing project documents
    return res.response(200, "All meeting reference records", data);
}, res);


// RETRIEVE ONE SINGLE MEETING DOCUMENT
const show = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { meetingId } = req.params;

    // retrieve single specified meeting document
    const meeting = await meetingService.retrieveOne(meetingId);

    // return back with meeting document not found response
    if (!meeting) return res.response(404, "The meeting ID is invalid");

    // return back with success response containg meeting document
    return res.response(200, "Requested meeting reference record", { meeting });
}, res);


// CREATE A NEW MEETING DOCUMENT
const create = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const allowedFields = ['project', 'summary', 'link', 'schedule', 'reference'];

    // extacting only allowed fields from request body
    const data = filterRequestBody(req.body, allowedFields);

    // create a new meeting document
    const meeting = await meetingService.create(data);

    // return back with failed to create meeting response once failed
    if (!meeting) throw new Error("Failed to create a meeting reference");

    // return back with success response containing newly created meeting document
    return res.response(201, "The meeting reference has been created", { meeting });
}, res);


// UDATE A MEETING DOCUMENT BY ID WHEN REQUEST USER IS ADMIN/SUPERVISOR OTHERWISE BY LEAD/MEMBERONE/MEMBERTWO
const update = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { meetingId } = req.params;

    // validate meeting project belongs to request supervisor
    if (req.user.role === "supervisor") {
        // retrieve meeting project supervisor id
        const meeting = await meetingService.retrieveOne(meetingId);

        // return back with meeting document not found response when document is unavailable
        if (!meeting) return res.response(404, "The meeting ID is invalid");

        // return back with access denied response if request supervisor isn't meeting project supervisor
        if (!meeting.project?.supervisor?._id.equals(req.user._id)) {
            return res.response(403, "Access forbidden");
        }
    }

    // initialize allowed fields array
    const allowedFields = ['summary', 'link', 'schedule', 'reference', 'status'];

    // retrieve only allowed fields from request body
    const changes = filterRequestBody(req.body, allowedFields);

    // update meeting document fields accordingly
    const meeting = await meetingService.update(meetingId, changes);

    // return back with meeting document not found response when document is unavailable
    if (!meeting) return res.response(404, "The meeting ID is invalid");

    // return back with success response containing update meeting document
    return res.response(200, "The meeting reference has been updated", { meeting });
}, res);


// DELETE MEETING DOCUMENT 
const del = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { meetingId } = req.params;

    // validate meetings ID
    validateMongooseObjectId(meetingId);

    // retrieve meetings document
    let meeting = await meetingService.retrieveOne(meetingId);

    // return back with invalid meeting id response; if document is unavailable
    if (!meeting) return res.response(404, "The meeting ID is invalid");

    // validate meeting project belongs to request supervisor
    if (req.user.role !== "supervisor") {
        // return back with access denied response if request supervisor isn't meeting project supervisor
        if (!meeting.project?.supervisor?._id.equals(req.user._id)) {
            return res.response(403, "Access forbidden");
        }
    }

    // attempt to delete single specified meeting document
    meeting = await meetingService.delete(meetingId);

    // return back with success response
    return res.response(200, "The meeting reference has been deleted");
}, res);


export default { index, projectMeetings, show, create, update, delete: del }