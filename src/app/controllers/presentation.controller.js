import validateMongooseObjectId from "../../utils/libs/database/validate.mongoose.object.id.js";
import buildMongoQuery from "../../utils/libs/database/build.mongo.query.js";
import presentationService from "../services/presentation.service.js";
import tryCatch from "../../utils/libs/helper/try.catch.js";
import httpCode from "../../utils/constants/http.code.js";
import userRole from "../../utils/constants/user.role.js";
import toast from "../../utils/constants/toast.js";
import env from "../../config/env.js";


// RETRIEVE ALL PROGRESS DOCUMENTS
const index = (req, res) => tryCatch(async () => {
    // retrieve all presentation documents optionally with query and page related with certain limits
    const data = await presentationService.retrieveAll(
        {
            searchQuery: req.query.query ?? '', // query search parameter to filter presentation documents
            currentPage: parseInt(req.query.page ?? 1), // page parameter to retrieve documents ahead of page count
            documentCount: parseInt(req.query.limit ?? env.document.count) // count parameter to retrieve certain document count on per page
        },
        {
            requestUser: {
                id: req.user._id ?? req.user.name, // request user role to get its specific presentation documents only
                role: req.user.role, // request user role to differentiate while retrieving its specific presentation documents
            }
        }
    );

    // return back with sucess response containg presentation documents
    return res.response(httpCode.SUCCESS, toast.DATA.ALL('presentation'), data);
}, res);


// RETRIEVE ALL PROJECT RELATED PROGRESSES
const projectProgresses = (req, res) => tryCatch(async () => {
    // vaidate project id
    validateMongooseObjectId(req.params.projectId);

    // retrieve project related presentation documents
    const data = await presentationService.retrieveAll(
        {
            searchQuery: req.query.query ?? '', // query search parameter to filter project documents
            currentPage: parseInt(req.query.page ?? 1), // page parameter to retrieve documents ahead of page count
            documentCount: parseInt(req.query.limit ?? env.document.count) // rpp (records per-page) parameter to retrieve certain documents per page
        },
        {
            userQuery: buildMongoQuery({
                field: 'project', value: req.params.projectId
            }, { isObjectId: true })
        }
    );

    // return back with success response containg project document
    return res.response(httpCode.SUCCESS, toast.DATA.ALL('project presentation'), data);
}, res);


// RETRIEVE ONE SINGLE PROGRESS DOCUMENT
const show = (req, res) => tryCatch(async () => {
    // vaidate parameter presentation id
    validateMongooseObjectId(req.params.presentationId);

    // retrieve single specified presentation document
    let presentation = await presentationService.retrieveOne(
        buildMongoQuery({ field: '_id', value: req.params.presentationId })
    );

    // return back with presentation document not found response
    if (!presentation) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('presentation'))

    // return back with success response containg presentation document
    return res.response(httpCode.SUCCESS, toast.DATA.ONE('presentation'), { presentation });
}, res);


// CREATE A NEW PROGRESS DOCUMENT
const create = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const fields = ['project', 'summary', 'fyp', 'resource'];

    // extacting only allowed fields from request body
    const data = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => fields.includes(field) && value)
    );

    // initialize presentation document
    let presentation = {};

    // create query to retrieve presentation document
    let query = buildMongoQuery({ field: 'project', value: data.project }, { isObjectId: true });
    query = { $and: [query, { fyp: data.fyp }] };

    // update presentation document if exists
    presentation = (await presentationService.retrieveOne(query))
        ? await presentationService.update(query, data)
        : await presentationService.create(data);

    // return back with failed to create presentation response once failed
    if (!presentation) throw new Error(toast.DATA.FAILED('create', 'presentation'));

    // reflect changes to the request user
    presentation = await presentationService.retrieveOne({ _id: presentation._id });

    // return back with success response containing newly created presentation document
    return res.response(httpCode.RESOURCE_CREATED, toast.DATA.CREATED('presentation'), { presentation });
}, res);


// UDATE A PROGRESS DOCUMENT BY ID WHEN REQUEST USER IS ADMIN/SUPERVISOR OTHERWISE BY LEAD/MEMBERONE/MEMBERTWO
const update = (req, res) => tryCatch(async () => {
    // vaidate parameter presentation id
    validateMongooseObjectId(req.params.presentationId);

    // build query for presentation id
    const query = buildMongoQuery({ field: '_id', value: req.params.presentationId });

    // retrieve presentation
    let presentation = await presentationService.retrieveOne(query);

    // initialize allowed fields array
    let fields = [];

    // role-based query generating
    switch (req.user.role) {
        case userRole.SUPERVISOR:
            // validate if presentation project belongs to request supervisor 
            if (!presentation.project.supervisor._id.equals(req.user._id)) {
                return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
            }

            // fields that supervisor could update
            fields = ['remarks', 'status']; break;

        case userRole.STUDENT:
            // validate if presentation project belongs to request student
            const projectBelongsToRequestUser = Object.entries(presentation.toObject().project)
                .slice(1, 4).some(([_, value]) => value?._id?.equals(req.user._id));

            if (!projectBelongsToRequestUser) {
                return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
            }

            // fields that student could update
            fields = ['summary', 'resource']; break;

        default:
            // fields that admin could update
            fields = ['summary', 'resource', 'remarks', 'status'];
    }

    // retrieve only allowed fields from request body
    const changes = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => value && fields.includes(field))
    );

    // update presentation document fields accordingly
    presentation = await presentationService.update(query, changes);

    // return back with presentation document not found response when document is unavailable
    if (!presentation) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('presentation'));

    // update presentation document with newly updated fields
    Object.assign(presentation, changes);

    // return back with success response containing update presentation document
    return res.response(httpCode.SUCCESS, toast.DATA.UPDATED('presentation'), { presentation });
}, res);


// DELETE PROGRESS DOCUMENT 
const del = (req, res) => tryCatch(async () => {
    // validate project ID
    validateMongooseObjectId(req.params.presentationId);

    // build query for presentation id
    const query = buildMongoQuery({ field: '_id', value: req.params.presentationId });

    // verify presentation project belongs to request user
    if (req.user.role !== userRole.ADMIN) {
        // retrieve presentation
        const presentation = await presentationService.retrieveOne(query);

        // validate if request project
        const projectBelongsToRequestUser = Object.entries(presentation.toObject().project)
            .slice(1, 5).some(([_, value]) => value?._id?.equals(req.user._id));

        if (!projectBelongsToRequestUser) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        };
    }
    // attempt to delete single specified presentation document
    await presentationService.delete(presentation._id);

    // return back with success response
    return res.response(httpCode.SUCCESS, toast.DATA.DELETED('presentation'));
}, res);


export default { index, projectProgresses, show, create, update, delete: del }