import httpCode from "../../utils/constants/http.code.js";
import status from "../../utils/constants/status.js";
import toast from "../../utils/constants/toast.js";
import userRole from "../../utils/constants/user.role.js";
import email from "../../utils/email.js";
import { objFields, tryCatch, password, validateMongoObjectID, str } from "../../utils/functions.js";
import userService from "../services/user.service.js"

// RETRIEVE ALL USER DOCUMENTS ACCORDINGLY
const all = (req, res) => tryCatch(async () => {
    // retrieve all user documents
    let users = await userService.all(req.query.q);

    // is request user is supervisor return only student documents
    if (req.user.role === userRole.SUPERVISOR) {
        users = users.filter(user => user.role === userRole.STUDENT);
    }

    // return back with success response containing user documents
    return res.response(httpCode.SUCCESS, toast.DATA.ALL('user'), { users });
}, res);

// RETRIEVE ONE SINGLE SPECIFIED USER DOCUMENT BY ID
const one = (req, res) => tryCatch(async () => {
    // vaidate is parameter ID is valid mongooseID
    validateMongoObjectID(req.params.userId);

    // retrieve specified user document
    let user = await userService.one({ _id: req.params.userId })

    // return back with user document not found response
    if (!user) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('user'));

    // return back with access denined response when same role trying to access same same user document
    // supervisor can not see another supervisor document details
    if (req.user.role === user.role) {
        return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
    }

    // return back with success response containg user document
    return res.response(httpCode.SUCCESS, toast.DATA.ONE('user'), { user });
}, res);

// CREATE A NEW UER DOCUMENT
const create = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const fields = ['name', 'email', 'nic', 'rollNo', 'role', 'image'];

    // extacting only allowed fields from request body
    const data = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => fields.includes(field) && value)
    );

    // generate random shuffled password string using user name
    const passwordString = password.generate();

    // create password hash and generate OTP
    data.password = await password.hash(passwordString);
    data.status = status.ACTIVE;
    data.verifiedAt = Date.now();

    // if supervisor tries to create a supervisor restrict them
    if (data.role && data.role !== userRole.STUDENT && req.user.role === userRole.SUPERVISOR) {
        return res.response(httpCode.ACCESS_DENIED, toast.MISC.FORBIDDEN);
    }

    // attempt to create a new user; throw registration failed error if unsuccessful
    const user = await userService.create(data);
    if (!user) throw new Error(toast.USER.REGISTRATION_FAILED);

    // email options
    const options = {
        template: 'login.creds.email',
        subject: 'Welcome to FYP Management System',
        user: {
            name: str.capEach(user.name),
            email: user.email,
            password: passwordString,
        }
    };

    // send email with OTP; throw failed to send email error when unsuccessful
    if (!(await email.send(user.email, options))) {
        await userService.delete(user._id);
        throw new Error(toast.USER.REGISTRATION_FAILED);
    }

    // return back with success response
    return res.response(httpCode.RESOURCE_CREATED, toast.REGISTRATION.SUCCESS);
}, res);

// UPDATE USER DOCUMENT
const update = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be updated
    const fields = ['name', 'status', 'image'];

    // retrieve only allowed fields from request body
    const changes = Object.fromEntries(
        Object.entries(req.body).filter(([field, value]) => fields.includes(field) && value)
    );

    // update user document fields accordingly
    let user = await userService.update({ _id: req.user.id }, changes);

    // return back with user document not found response when document is unavailable
    if (!user) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('user'));

    // omit sensitive fields (password, verificationOTP) from user document
    user = objFields.except(user, ['password', 'verificationOTP'], { mongooseObject: true });

    // update user document fields with newly updated fields
    Object.assign(user, changes);

    // return back with success response containing update user document
    return res.response(httpCode.SUCCESS, toast.USER.UPDATED_SUCCESS, { user });
}, res);

// DELETE USER DOCUMENTS BY ID
const del = (req, res) => tryCatch(async () => {
    // delete specified user document
    const user = await userService.delete(req.params.userId);

    // return back with user document not found response when unavailable
    if (!user) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.VALIDATION.INVALID_ID('user'))

    // return back with success response
    return res.response(httpCode.SUCCESS, toast.USER.DELETED_SUCCESS);
}, res);

// UPDATE USER PASSWORD
const updatePassword = (req, res) => tryCatch(async () => {
    // return back with incorrect old password response when old password doesn't match
    if (!(await password.compare(req.body.oldPassword, req.user.password))) {
        return res.response(httpCode.INVALID_REQUEST, toast.PASSWORD.UPDATE_FAILED);
    };

    // create password hash
    const hash = await password.hash(req.body.password)

    // throw error when password update was unsuccessfull
    if (!(await userService.update({ _id: req.user._id }, { password: hash }))) {
        throw new Error(toast.MISC.INTERNAL_ERROR);
    }

    // return back with success response
    return res.response(httpCode.SUCCESS, toast.PASSWORD.UPDATE_SUCCESS);
}, res);

export default { all, one, create, update, delete: del, updatePassword }