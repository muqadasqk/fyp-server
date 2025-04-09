import validateMongooseObjectId from "../../utils/libs/database/validate.mongoose.object.id.js";
import tryCatch from "../../utils/libs/helper/try.catch.js";
import userService from "../services/user.service.js"
import email from "../../utils/libs/helper/email.js";
import filterRequestBody from "../../utils/libs/helper/filter.request.body.js";
import User from "../models/user.model.js";

// RETRIEVE ALL USER DOCUMENTS ACCORDINGLY
const index = (req, res) => tryCatch(async () => {
    // retrieve user documents
    const data = await userService.retrieveAll(req.body.page ?? {});

    // return back with success response containing user documents
    return res.response(200, "All users records", data);
}, res);


// RETRIEVE ONE SINGLE SPECIFIED USER DOCUMENT BY ID
const show = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { userId } = req.params;

    // vaidate parameter user id
    validateMongooseObjectId(userId);

    // retrieve specified user document
    let user = await userService.retrieveOne({ _id: userId });

    // return back with user document not found response
    if (!user) return res.response(404, "The user ID is invalid");

    // return back with success response containg user document
    return res.response(200, "Requested user record", { user });
}, res);


// CREATE A NEW UER DOCUMENT
const create = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const allowedFields = ["name", "email", "phone", "cnic", "rollNo", "role", "image"];

    // extacting only allowed fields from request body
    const data = filterRequestBody(req.body, allowedFields);

    // generate random password 
    data.password = User.randomPassword();
    data.status = "active";
    data.verifiedAt = Date.now();

    // attempt to create a new user; throw registration failed error if unsuccessful
    const user = await userService.create(data);
    if (!user) throw new Error(`Failed to create ${data.role}`);

    // email options
    const options = {
        template: 'login.creds.email',
        subject: 'Welcome to FYP Management System',
        user: {
            name: user.name.capEach(),
            email: user.email,
            password: data.password,
        }
    };

    // send email with OTP; throw failed to send email error when unsuccessful
    if (!(await email.send(user.email, options))) {
        await userService.delete(user._id);
        throw new Error(`Failed to create ${data.role}`);
    }

    // return back with success response
    return res.response(201, `Successfully created ${data.role}`, { user });
}, res);


// UPDATE USER DOCUMENT
const update = (req, res) => tryCatch(async () => {
    // retrieve only allowed fields from request body
    const changes = filterRequestBody(req.body, ['name', 'email', 'phone', 'image']);

    // update user document fields accordingly
    const user = await userService.update({ _id: req.user._id }, changes);

    // return back with user document not found response when document is unavailable
    if (!user) return res.response(404, "The user ID is invalid");

    // return back with success response containing update user document
    return res.response(200, "The changes have been saved", { user });
}, res);


// DELETE USER DOCUMENTS BY ID
const del = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { userId } = req.params;

    // delete specified user document
    const user = await userService.delete(userId);

    // return back with user document not found response when unavailable
    if (!user) return res.response(404, "The user ID is invalid");

    // return back with success response
    return res.response(200, "The user record deleted", { user });
}, res);


// UPDATE USER PASSWORD
const updatePassword = (req, res) => tryCatch(async () => {
    // destructure request body
    const { currentPassword, password } = req.body;

    // return current authenticated user with password
    const user = await userService.retrieveOne({ _id: req.user._id }, { withPassword: true });

    // return back with bad request response if passswords don't match
    if (!(await user.comparePassword(currentPassword))) {
        return res.response(400, "The old password is incorrect");
    };

    // throw error when password update was unsuccessfull
    if (!(await userService.update({ _id: req.user._id }, { password }))) {
        throw new Error("There was an internal server error");
    }

    // return back with success response
    return res.response(200, "Password updated successfully");
}, res);


// UPDATE USER STATUS
const updateStatus = (req, res) => tryCatch(async () => {
    // destructure request parameters
    const { userId } = req.params;

    // destructure request body
    const { statusCode } = req.body;

    // generate user status data based on statuCode
    let status;
    switch (statusCode) {
        case "20001": status = { label: "approved", value: "active" }; break;
        case "20002": status = { label: "rejected", value: "rejected" }; break;
        case "20003": status = { label: "locked", value: "inactive" }; break;
        case "20004": status = { label: "unlocked", value: "active" }; break;
        default: throw new Error("An unknown status code");
    }

    // vaidate parameter user id
    validateMongooseObjectId(userId);

    // update user status
    const user = statusCode === "20002"
        ? await userService.delete(userId)
        : await userService.update({ _id: userId }, { status: status.value });

    // return back with user document not found response when document is unavailable
    if (!user) return res.response(404, "The user ID is invalid");

    // return back with success response containing update user document
    return res.response(200, `The user acount has been ${status.label}`, { user });
}, res);


export default { index, show, create, update, delete: del, updatePassword, updateStatus }