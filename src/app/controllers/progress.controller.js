import validateMongooseObjectId from "../../utils/libs/database/validate.mongoose.object.id.js";
import buildMongoQuery from "../../utils/libs/database/build.mongo.query.js";
import progressService from "../services/progress.service.js";
import tryCatch from "../../utils/libs/helper/try.catch.js";
import httpCode from "../../utils/constants/http.code.js";
import userRole from "../../utils/constants/user.role.js";
import toast from "../../utils/constants/toast.js";
import env from "../../config/env.js";


// RETRIEVE ALL PROGRESS DOCUMENTS
const index = (req, res) => tryCatch(async () => {
    // retrieve all progress documents optionally with query and page related with certain limits
    const data = await progressService.retrieveAll(
        {
            searchQuery: req.query.q ?? '', // query search parameter to filter progress documents
            currentPage: parseInt(req.query.p ?? 1), // page parameter to retrieve documents ahead of page count
            documentCount: parseInt(req.query.c ?? env.document.count) // count parameter to retrieve certain document count on per page
        },
        {
            requestUser: {
                id: req.user._id ?? req.user.name, // request user role to get its specific progress documents only
                role: req.user.role, // request user role to differentiate while retrieving its specific progress documents
            }
        }
    );

    // return back with sucess response containg progress documents
    return res.response(httpCode.SUCCESS, toast.DATA.ALL('progress'), data);
}, res);


// RETRIEVE ALL PROJECT RELATED PROGRESSES
const projectProgresses = (req, res) => tryCatch(async () => {
    // vaidate project id
    validateMongooseObjectId(req.params.projectId);

    // retrieve project related progress documents
    const data = await progressService.retrieveAll(
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
    return res.response(httpCode.SUCCESS, toast.DATA.ALL('project progress'), data);
}, res);


// RETRIEVE ONE SINGLE PROGRESS DOCUMENT
const show = (req, res) => tryCatch(async () => {
    // vaidate parameter progress id
    validateMongooseObjectId(req.params.progressId);

    // retrieve single specified progress document
    let progress = await progressService.retrieveOne(
        buildMongoQuery({ field: '_id', value: req.params.progressId })
    );

    // return back with progress document not found response
    if (!progress) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('progress'))

    // return back with success response containg progress document
    return res.response(httpCode.SUCCESS, toast.DATA.ONE('progress'), { progress });
}, res);


// CREATE A NEW PROGRESS DOCUMENT
const create = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const fields = ['project', 'summary', 'fyp', 'resource'];

    // extacting only allowed fields from request body
    const data = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => fields.includes(field) && value)
    );

    // initialize progress document
    let progress = {};

    // create query to retrieve progress document
    let query = buildMongoQuery({ field: 'project', value: data.project }, { isObjectId: true });
    query = { $and: [query, { fyp: data.fyp }] };

    // update progress document if exists
    progress = (await progressService.retrieveOne(query))
        ? await progressService.update(query, data)
        : await progressService.create(data);

    // return back with failed to create progress response once failed
    if (!progress) throw new Error(toast.DATA.FAILED('create', 'progress'));

    // reflect changes to the request user
    progress = await progressService.retrieveOne({ _id: progress._id });

    // return back with success response containing newly created progress document
    return res.response(httpCode.RESOURCE_CREATED, toast.DATA.CREATED('progress'), { progress });
}, res);


// UDATE A PROGRESS DOCUMENT BY ID WHEN REQUEST USER IS ADMIN/SUPERVISOR OTHERWISE BY LEAD/MEMBERONE/MEMBERTWO
const update = (req, res) => tryCatch(async () => {
    // vaidate parameter progress id
    validateMongooseObjectId(req.params.progressId);

    // build query for progress id
    const query = buildMongoQuery({ field: '_id', value: req.params.progressId });

    // retrieve progress
    let progress = await progressService.retrieveOne(query);

    // initialize allowed fields array
    let fields = [];

    // role-based query generating
    switch (req.user.role) {
        case userRole.SUPERVISOR:
            // validate if progress project belongs to request supervisor 
            if (!progress.project.supervisor._id.equals(req.user._id)) {
                return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
            }

            // fields that supervisor could update
            fields = ['remarks', 'status']; break;

        case userRole.STUDENT:
            // validate if progress project belongs to request student
            const projectBelongsToRequestUser = Object.entries(progress.toObject().project)
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

    // update progress document fields accordingly
    progress = await progressService.update(query, changes);

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
    validateMongooseObjectId(req.params.progressId);

    // build query for progress id
    const query = buildMongoQuery({ field: '_id', value: req.params.progressId });

    // verify progress project belongs to request user
    if (req.user.role !== userRole.ADMIN) {
        // retrieve progress
        const progress = await progressService.retrieveOne(query);

        // validate if request project
        const projectBelongsToRequestUser = Object.entries(progress.toObject().project)
            .slice(1, 5).some(([_, value]) => value?._id?.equals(req.user._id));

        if (!projectBelongsToRequestUser) {
            return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
        };
    }
    // attempt to delete single specified progress document
    await progressService.delete(progress._id);

    // return back with success response
    return res.response(httpCode.SUCCESS, toast.DATA.DELETED('progress'));
}, res);


export default { index, projectProgresses, show, create, update, delete: del }