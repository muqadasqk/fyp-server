import { objFields, password, str, tryCatch, verifyJWT } from "../../utils/functions.js";
import jwt from 'jsonwebtoken';
import email from '../../utils/email.js';
import httpCode from "../../utils/constants/http.code.js";
import toast from "../../utils/constants/toast.js";
import userService from "../services/user.service.js";
import status from "../../utils/constants/status.js";
import env from "../../config/env.js";

// SIGNUP FOR SUPERVISOR AND STUDENT
const signup = (req, res) => tryCatch(async () => {
  // only fields that are allowed to be inserted
  const fields = ['name', 'email', 'nic', 'rollNo', 'role', 'password', 'image'];

  // extacting only allowed fields from request body
  const data = Object.fromEntries(
    Object.entries(req.body).filter(([field, value]) => fields.includes(field) && value)
  );

  // create password hash and generate OTP
  data.password = await password.hash(data.password);
  data.verificationOTP = str.generateOTP(6);

  // attempt to create a new user; throw registration failed error if unsuccessful
  const user = await userService.create(data);
  if (!user) throw new Error(toast.USER.REGISTRATION_FAILED);

  // email options
  const options = {
    template: 'otp.email',
    user: str.capEach(user.name),
    subject: 'Registration email verification',
    otp: user.verificationOTP
  };

  // send email with OTP; throw failed to send email error when unsuccessful
  if (!(await email.send(user.email, options))) {
    await userService.delete(user._id);
    throw new Error(toast.OTP.FAILED);
  }

  // return back with success response
  return res.response(httpCode.RESOURCE_CREATED, toast.OTP.SENT);
}, res);


// VERIFY EMAIL ADDRESS
const verifyEmail = (req, res) => tryCatch(async () => {
  // retrieve user by email
  const user = await userService.retrieveOne({ email: req.body.email });

  // return back with failure response whether user is not found or OTP is invalid
  if (!user || user.verificationOTP != req.body.otp) {
    return res.response(httpCode.INVALID_DATA, toast.OTP.VFAILED);
  }

  // data with fields that are to be updated
  const data = {
    status: status.INACTIVE,
    verifiedAt: Date.now(),
    verificationOTP: null
  };

  // throw error when update was unsuccessfull
  if (!(await userService.update({ _id: user._id }, data))) {
    throw new Error(toast.MISC.INTERNAL_ERROR);
  }

  // return back with success response
  return res.response(httpCode.SUCCESS, toast.REGISTRATION.SUCCESS);
}, res);


// SIGIN FOR SUPERVISOR AND STUDENT
const signin = (req, res) => tryCatch(async () => {
  // retrieve user by email 
  let user = await userService.retrieveOne({ email: req.body.email });

  // return back with access denied response whether user is not found or password is invalid
  if (!user || !(await password.compare(req.body.password, user.password))) {
    return res.response(httpCode.ACCESS_DENIED, toast.AUTHENTICATION.FAILED);
  }

  // return back with access denied response if user status is not active
  if (user.status != status.ACTIVE) {
    return res.response(httpCode.ACCESS_DENIED, toast.ACCOUNT.NOT_ACTIVE);
  }

  // generate jwt token with user ID payload, expiring in 30 days
  const token = jwt.sign({ userId: user._id }, env.secret.key, {
    expiresIn: '30d',
  });

  // omit sensitive fields (password, verificationOTP) from user record object
  user = objFields.except(user, ['password', 'verificationOTP'], { mongooseObject: true });

  // return back with success response containing user and token
  return res.response(httpCode.SUCCESS, toast.AUTHENTICATION.SUCCESS, { user, token });
}, res);


// ADMIN SIGIN
const adminSignin = (req, res) => tryCatch(async () => {
  // retrieve admin login credentials from .env file
  const admin = {
    username: env.admin.username,
    password: env.admin.password
  };

  // return back with access denied response whether admin username or password is invalid
  if (admin.username !== req.body.username || !(await password.compare(req.body.password, admin.password))) {
    return res.response(httpCode.ACCESS_DENIED, toast.AUTHENTICATION.ADMIN_FAILED);
  }

  // generate jwt token with admin username as user ID payload, expiring in 30 days
  const token = jwt.sign({ userId: admin.username }, env.secret.key, {
    expiresIn: '30d',
  });

  // admin records object to send in the response
  // const admin = {
  //   name: admin.username,
  //   role: userRole.ADMIN
  // }

  // return back with success response containing token
  return res.response(httpCode.SUCCESS, toast.AUTHENTICATION.GRANTED, { token });
}, res);


// RESET PASSWORD FOR SUPERVISOR AND STUDENT
const resetPassword = (req, res) => tryCatch(async () => {
  // verify and decode token
  const { userId } = await verifyJWT(req.params.token);

  // retrieve user by user ID extracted from token; return back with user not found response if unavailable
  const user = await userService.retrieveOne({ _id: userId });
  if (!user) return res.response(httpCode.ACCESS_DENIED, toast.MISC.ACCESS_DENIED);

  // create password hash
  const hash = await password.hash(req.body.password);

  // throw error when password reset was unsuccessfull
  if (!(await userService.update({ _id: user._id }, { password: hash }))) {
    throw new Error(toast.MISC.INTERNAL_ERROR);
  }

  // return back with success response
  return res.response(httpCode.SUCCESS, toast.PASSWORD.RESET_SUCCESS);
}, res);


// VERIFY OTP
const verifyOTP = (req, res) => tryCatch(async () => {
  // retrieve user by email
  const user = await userService.retrieveOne({ email: req.body.email });

  // return back with failure response whether user is not found or OTP is invalid
  if (!user || user.verificationOTP != req.body.otp) {
    return res.response(httpCode.INVALID_DATA, toast.OTP.VFAILED);
  }

  // throw error when making verificationOTP null was unsuccessfull
  if (!(await userService.update({ _id: user._id }, { verificationOTP: null }))) {
    throw new Error(toast.MISC.INTERNAL_ERROR);
  }

  // generate jwt token with user ID payload, expiring in 15 minutes
  const token = jwt.sign({ userId: user._id }, env.secret.key, {
    expiresIn: '900s',
  });

  // return back with success response containing token
  return res.response(httpCode.SUCCESS, toast.OTP.VSUCCESS, { token });
}, res);


// SENT OTP
const sendOTP = (req, res) => tryCatch(async () => {
  // retrieve user by email; return invalid account response if not found
  let user = await userService.retrieveOne({ email: req.body.email });
  if (!user) return res.response(httpCode.RESOURCE_NOT_FOUND, toast.ACCOUNT.INVALID);

  // generate random OTP of 6 digits
  const generateOTP = str.generateOTP(6);

  // email options
  const options = {
    template: 'otp.email',
    user: str.capEach(user.name),
    otp: generateOTP
  };

  // send email with OTP and check if it was sent othwerwise throw failed to send email error
  if (!(await email.send(user.email, options))) {
    throw new Error(toast.OTP.FAILED);
  }

  // throw error when OTP storing was unsuccessfull
  if (!(await userService.update({ _id: user._id }, { verificationOTP: generateOTP }))) {
    throw new Error(toast.MISC.INTERNAL_ERROR);
  }

  // return back with success response
  return res.response(httpCode.SUCCESS, toast.OTP.SENT);
}, res);


export default { signup, verifyEmail, signin, adminSignin, resetPassword, verifyOTP, sendOTP }