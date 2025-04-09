import validateMongooseObjectId from "../../utils/libs/database/validate.mongoose.object.id.js";
import presentationService from "../services/presentation.service.js";
import tryCatch from "../../utils/libs/helper/try.catch.js";
import filterRequestBody from "../../utils/libs/helper/filter.request.body.js";

// RETRIEVE ALL PROGRESS DOCUMENTS
const index = (req, res) => tryCatch(async () => {
    // retrieve project documents
    const data = await presentationService.retrieveAll(req.user, req.body.page ?? {});

    // return back with success response containing presentation documents
    return res.response(200, "All presentation records", data);
}, res);


// RETRIEVE ALL PROJECT RELATED PROGRESSES
const projectProgresses = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { projectId } = req.params;

    // vaidate project id
    validateMongooseObjectId(projectId);

    // retrieve project documents
    const data = await presentationService.retrieveMany(projectId, req.body.page ?? {});

    // return back with success response containing project documents
    return res.response(200, "All project presentation records", data);
}, res);


// RETRIEVE ONE SINGLE PROGRESS DOCUMENT
const show = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { presentationId } = req.params;

    // retrieve single specified presentation document
    const presentation = await presentationService.retrieveOne(presentationId);

    // return back with presentation document not found response
    if (!presentation) return res.response(404, "The presentation ID is invalid");

    // return back with success response containg presentation document
    return res.response(200, "Requested presentation record", { presentation });
}, res);


// CREATE A NEW PROGRESS DOCUMENT
const create = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const allowedFields = ['project', 'summary', 'fyp', 'resource'];

    // extacting only allowed fields from request body
    const data = filterRequestBody(req.body, allowedFields);

    // update presentation document if exists
    let presentation = (await presentationService.retrieveOne({ project: data.project }, { fyp: data.fyp }))

    // upsert the presentation document
    presentation = !!presentation
        ? await presentationService.update({ _id: presentation._id }, data)
        : await presentationService.create(data);

    // return back with failed to create presentation response once failed
    if (!presentation) throw new Error("Failed to create a presentation");

    // return back with success response containing newly created presentation document
    return res.response(201, "The presentation has been initialized", { presentation });
}, res);


// UDATE A PROGRESS DOCUMENT BY ID WHEN REQUEST USER IS ADMIN/SUPERVISOR OTHERWISE BY LEAD/MEMBERONE/MEMBERTWO
const update = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { presentationId } = req.params;

    // vaidate parameter presentation id
    validateMongooseObjectId(presentationId);

    // retrieve presentation
    let presentation = await presentationService.retrieveOne(presentationId);

    // return back with presentation document not found response when document is unavailable
    if (!presentation) return res.response(404, "The presentation ID is invalid");

    // initialize allowed fields array
    let allowedFields = [];

    // role-based query generating
    switch (req.user.role) {
        case "supervisor":
            // validate if presentation project belongs to request supervisor 
            if (!presentation.project.supervisor._id.equals(req.user._id)) {
                return res.response(403, "Access forbidden");
            }

            // fields that supervisor could update
            allowedFields = ['remarks', 'status']; break;

        case "student":
            // validate if presentation project belongs to request student
            const requestStudentProject = Object.entries(presentation.toObject().project)
                .slice(1, 4).some(([_, value]) => value?._id?.equals(req.user._id));

            if (!requestStudentProject) return res.response(403, "Access forbidden");

            // fields that student could update
            allowedFields = ['summary', 'resource']; break;

        default:
            // fields that admin could update
            allowedFields = ['summary', 'resource', 'remarks', 'status'];
    }

    // retrieve only allowed fields from request body
    const changes = filterRequestBody(req.body, allowedFields);

    // update presentation document fields accordingly
    presentation = await presentationService.update({ _id: presentation._id }, changes);

    // return back with success response containing update presentation document
    return res.response(200, "The presentation has been updated", { presentation });
}, res);


// DELETE PROGRESS DOCUMENT 
const del = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { presentationId } = req.params;

    // validate id is a valid mongoose ID
    validateMongooseObjectId(presentationId);

    // verify presentation project belongs to request student
    if (req.user.role !== "student") {
        // retrieve presentation
        const presentation = await presentationService.retrieveOne({ _id: presentationId });

        // return back with presentation document not found response
        if (!presentation) return res.response(404, "The presentation ID is invalid");

        // validate if project is related to request student
        const requestStudentProject = Object.entries(presentation.toObject().project)
            .slice(1, 4).some(([_, value]) => value?._id?.equals(req.user._id));

        if (!requestStudentProject) return res.response(403, "Access forbidden");
    }

    // attempt to delete single specified presentation document
    const presentation = await presentationService.delete(presentationId);

    // return back with presentation document not found response
    if (!presentation) return res.response(404, "The presentation ID is invalid");

    // return back with success response
    return res.response(200, "The presentation has been deleted", { presentation });
}, res);


export default { index, projectProgresses, show, create, update, delete: del }