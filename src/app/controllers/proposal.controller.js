import validateMongooseObjectId from "../../utils/libs/database/validate.mongoose.object.id.js";
import buildMongoQuery from "../../utils/libs/database/build.mongo.query.js";
import tryCatch from "../../utils/libs/helper/try.catch.js";
import proposalService from "../services/proposal.service.js";
import httpCode from "../../utils/constants/http.code.js";
import userRole from "../../utils/constants/user.role.js";
import toast from "../../utils/constants/toast.js";
import env from "../../config/env.js";

// RETRIEVE ALL IDEA DOCUMENTS
const index = (req, res) => tryCatch(async () => {
    // retrieve all proposal documents optionally with query and page related with certain limits
    const data = await proposalService.retrieveAll({
        searchQuery: req.query.query ?? '', // query search parameter to filter proposal documents
        currentPage: parseInt(req.query.page ?? 1), // page parameter to retrieve documents ahead of page count
        documentCount: parseInt(req.query.limit ?? env.document.count) // rpp (records per-page) parameter to retrieve certain documents per page
    });

    // return back with sucess response containg proposal documents
    return res.response(httpCode.SUCCESS, toast.DATA.ALL('proposal'), data);
}, res);


// RETRIEVE ONE SINGLE IDEA DOCUMENT
const show = (req, res) => tryCatch(async () => {
    // vaidate parameter proposal id
    validateMongooseObjectId(req.params.proposalId);

    // build query to retrieve proposal document matching _id/lead/memberOne|Two
    const query = buildMongoQuery({
        fields: ['_id', 'lead', 'memberOne', 'memberTwo'],
        value: req.params.proposalId
    }, { isObjectId: true })

    // retrieve single specified proposal document
    let proposal = await proposalService.retrieveOne(query);

    // return back with proposal document not found response
    if (!proposal) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('proposal'))

    // return back with success response containg proposal document
    return res.response(httpCode.SUCCESS, toast.DATA.ONE('proposal'), { proposal });
}, res);


// CREATE A NEW IDEA DOCUMENT
const create = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const fields = ['memberOne', 'memberTwo', 'title', 'abstract', 'type', 'category'];

    // extacting only allowed fields from request body
    const data = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => fields.includes(field) && value)
    );

    // attempt to create a new proposal document; throw failed to create error if unsuccessful
    const proposal = await proposalService.create({ ...data, lead: req.user._id });
    if (!proposal) throw new Error(toast.DATA.FAILED('create', 'proposal'));

    // return back with success response containing newly created proposal document
    return res.response(httpCode.RESOURCE_CREATED, toast.DATA.CREATED('proposal'), { proposal });
}, res);


// UDATE A IDEA DOCUMENT BY ID WHEN REQUEST USER IS ADMIN ONLY
const update = (req, res) => tryCatch(async () => {
    // vaidate parameter proposal id
    validateMongooseObjectId(req.params.proposalId);

    // allowed fields that can be modified
    const fields = ['remarks', 'status'];

    // retrieve only allowed fields from request body
    const changes = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => fields.includes(field) && value)
    );

    // update proposal document fields accordingly
    const proposal = await proposalService.update({ _id: req.params.proposalId }, changes);

    // update reponse proposal document with changes
    Object.assign(proposal, changes);

    // return back with success response containing update proposal document
    return res.response(httpCode.SUCCESS, toast.DATA.UPDATED('proposal'), { proposal });
}, res);


// DELETE IDEA DOCUMENT 
const del = (req, res) => tryCatch(async () => {
    // validate proposal ID
    validateMongooseObjectId(req.params.proposalId);

    // if requet user is student
    if (req.user.role === userRole.STUDENT) {
        // retrieve request user related proposal document when lead
        const proposal = await proposalService.retrieveOne({ _id: req.params.proposalId, lead: req.user._id });

        // return back with access denied response; if proposal document not found
        if (!proposal) return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
    }

    // attempt to delete single specified proposal document
    const proposal = await proposalService.delete(req.params.proposalId);

    // return back with proposal document not found response when document is unavailable
    if (!proposal) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('proposal'));

    // return back with success response
    return res.response(httpCode.SUCCESS, toast.DATA.DELETED('proposal'));
}, res);


export default { index, show, create, update, delete: del }