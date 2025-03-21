import jwt from 'jsonwebtoken';

import tryCatch from '../../utils/libs/helper/try.catch.js';
import userService from "../services/user.service.js";
import password from "../../utils/libs/helper/password.js";
import generateOtp from '../../utils/libs/helper/generate.otp.js';
import httpCode from "../../utils/constants/http.code.js";
import toast from "../../utils/constants/toast.js";
import email from '../../utils/libs/helper/email.js';
import status from "../../utils/constants/status.js";
import validateAndDecodeToken from '../../utils/libs/helper/validate.and.decode.token.js';
import env from "../../config/env.js";
import buildMongoQuery from '../../utils/libs/database/build.mongo.query.js';


// SIGNUP FOR SUPERVISOR AND STUDENT
const signup = (req, res) => tryCatch(async () => {
  // only fields that are allowed to be inserted
  const fields = ['name', 'email', 'nic', 'rollNo', 'role', 'password', 'image'];

  // extacting only allowed fields from request body
  const data = Object.fromEntries(
    Object.entries(req.body).filter(([field, value]) => fields.includes(field) && value)
  );

  // create password hash and generate OTP
  data.password = await password.createHash(data.password);
  data.verificationOTP = generateOtp();

  // attempt to create a new user; throw registration failed error if unsuccessful
  const user = await userService.create(data);
  if (!user) throw new Error(toast.USER.REGISTRATION_FAILED);

  // email options
  const options = {
    template: 'otp.email',
    user: user.name.cap(),
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
  let user = await userService.retrieveOne(
    buildMongoQuery({
      fields: ['email', 'nic', 'rollNo'], value: req.body.username
    })
  );

  // return back with access denied response whether user is not found or password is invalid
  if (!user || !(await password.verify(req.body.password, user.password))) {
    return res.response(httpCode.ACCESS_DENIED, toast.AUTHENTICATION.FAILED);
  }

  // return back with access denied response if user status is not active
  if (user.status != status.ACTIVE) {
    return res.response(httpCode.ACCESS_DENIED, toast.ACCOUNT.NOT_ACTIVE);
  }

  // generate jwt token with user ID payload, expiring in 30 days
  const token = jwt.sign({ _id: user._id }, env.secret.key, {
    expiresIn: '30d',
  });

  // omit sensitive fields (password, verificationOTP) from user record object
  user = user.except(['password', 'verificationOTP'], true);

  // return back with success response containing user and token
  return res.response(httpCode.SUCCESS, toast.AUTHENTICATION.SUCCESS, { user, token });
}, res);


// RESET PASSWORD FOR SUPERVISOR AND STUDENT
const resetPassword = (req, res) => tryCatch(async () => {
  // valiate and decode token
  const { _id } = await validateAndDecodeToken(req.headers["token"]);

  // retrieve user by user ID extracted from token; return back with user not found response if unavailable
  const user = await userService.retrieveOne({ _id });
  if (!user) return res.response(httpCode.ACCESS_DENIED, toast.MISC.ACCESS_DENIED);

  // create password hash
  const hash = await password.createHash(req.body.password);

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
  const token = jwt.sign({ _id: user._id }, env.secret.key, {
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
  const verificationOTP = generateOtp(6);

  // email options
  const options = {
    template: 'otp.email',
    user: user.name.capEach(),
    subject: req.body.subject ?? 'OTP Verification',
    otp: verificationOTP
  };

  // send email with OTP and check if it was sent othwerwise throw failed to send email error
  if (!(await email.send(user.email, options))) {
    throw new Error(toast.OTP.FAILED);
  }

  // throw error when OTP storing was unsuccessfull
  if (!(await userService.update({ _id: user._id }, { verificationOTP }))) {
    throw new Error(toast.MISC.INTERNAL_ERROR);
  }

  // return back with success response
  return res.response(httpCode.SUCCESS, toast.OTP.SENT);
}, res);


export default { signup, verifyEmail, signin, resetPassword, verifyOTP, sendOTP }