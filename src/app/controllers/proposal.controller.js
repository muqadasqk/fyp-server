import validateMongooseObjectId from "../../utils/libs/database/validate.mongoose.object.id.js";
import tryCatch from "../../utils/libs/helper/try.catch.js";
import proposalService from "../services/proposal.service.js";
import filterRequestBody from "../../utils/libs/helper/filter.request.body.js";

// RETRIEVE ALL IDEA DOCUMENTS
const index = (req, res) => tryCatch(async () => {
    // retrieve proposal documents
    const data = await proposalService.retrieveAll(req.body.page ?? {});

    // return back with success response containing proposal documents
    return res.response(200, "All proposal records", data);
}, res);


// RETRIEVE ONE SINGLE IDEA DOCUMENT
const show = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { proposalId } = req.params;

    // vaidate parameter proposal id
    validateMongooseObjectId(proposalId);

    // retrieve single specified proposal document
    const proposal = await proposalService.retrieveOne(proposalId);

    // return back with proposal document not found response
    if (!proposal) return res.response(404, "The proposal ID is invalid")

    // return back with success response containg proposal document
    return res.response(200, "Requested proposal record", { proposal });
}, res);


// CREATE A NEW IDEA DOCUMENT
const create = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const allowedFields = ['memberOne', 'memberTwo', 'title', 'abstract', 'type', 'category'];

    // extacting only allowed fields from request body
    const data = filterRequestBody(req.body, allowedFields);

    // attempt to create a new proposal document; throw failed to create error if unsuccessful
    const proposal = await proposalService.create({ lead: req.user._id, ...data });
    if (!proposal) throw new Error("Failed to create proposal");

    // return back with success response containing newly created proposal document
    return res.response(200, "The proposal was created", { proposal });
}, res);


// UPDATE A IDEA DOCUMENT BY ID WHEN REQUEST USER IS ADMIN ONLY
const update = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { proposalId } = req.params;

    // vaidate parameter proposal id
    validateMongooseObjectId(proposalId);

    // allowed fields that can be modified
    const allowedFields = ["supervisor", "remarks", "statusCode"];

    // retrieve only allowed fields from request body
    const changes = filterRequestBody(req.body, allowedFields);

    // generate user status data based on statuCode
    let status;
    if (changes?.statusCode) switch (changes.statusCode) {
        case 20001: status = { label: "accepted", value: "accepted" }; break;
        case 20002: status = { label: "accepted with conditions", value: "conditionallyAccepted" }; break;
        case 20003: status = { label: "rejected", value: "rejected" }; break;
        default: throw new Error("An unknown status code");
    }

    // return back with bad request if proposal was accepted but no supervisor assigned
    if (changes?.statusCode !== 20003 && !changes?.supervisor) {
        return res.response(400, "Supervisor is required once proposal is accepted");
    }

    // adjust the status accordingly
    changes.status = status.value;

    // update proposal document fields accordingly
    const proposal = await proposalService.update({ _id: proposalId }, changes);

    // return back with proposal document not found response
    if (!proposal) return res.response(404, "The proposal ID is invalid");

    // return back with success response containing update proposal document
    return res.response(200, `The proposal was ${status.label}`, { proposal });
}, res);


// DELETE IDEA DOCUMENT 
const del = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { proposalId } = req.params;

    // vaidate parameter proposal id
    validateMongooseObjectId(proposalId);

    // if requet user is student
    if (req.user.role === "student") {
        // retrieve request user related proposal document when lead
        const proposal = await proposalService.retrieveOne({ _id: proposalId, lead: req.user._id });

        // return back with access denied response; if proposal document not found
        if (!proposal) return res.response(403, "Access forbidden");
    }

    // attempt to delete single specified proposal document
    const proposal = await proposalService.delete(proposalId);

    // return back with proposal document not found response when document is unavailable
    if (!proposal) return res.response(404, "The proposal ID is invalid");

    // return back with success response
    return res.response(200, "The proposal has been deleted");
}, res);


export default { index, show, create, update, delete: del }