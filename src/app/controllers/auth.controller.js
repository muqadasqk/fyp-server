import tryCatch from '../../utils/libs/helper/try.catch.js';
import filterRequestBody from "../../utils/libs/helper/filter.request.body.js";
import userService from "../services/user.service.js";
import email from '../../utils/libs/helper/email.js';
import validateAndDecodeToken from '../../utils/libs/helper/validate.and.decode.token.js';
import Verification from '../models/verification.model.js';

// SIGNUP FOR SUPERVISOR AND STUDENT
const signup = (req, res) => tryCatch(async () => {
    // only fields that are allowed to be inserted
    const allowedFields = ["name", "email", "phone", "cnic", "rollNo", "role", "password", "image"];

    // extacting only allowed fields from request body
    const data = filterRequestBody(req.body, allowedFields);

    // attempt to create a new user; throw registration failed error if unsuccessful
    if (!await userService.create(data)) throw new Error("The signup was failed");

    // email options
    const options = {
        subject: "Signup Email Confirmation",
        user: data.name.capEach(),
        otp: await Verification.generate(data.email, 5),
        template: "otp.email",
    };

    // send email with OTP; throw failed to send email error when unsuccessful
    // email.send(data.email, options);
    if (!(await email.send(data.email, options))) {
        await userService.delete(user._id);
        throw new Error("Failed to send OTP code");
    }

    // return back with success response
    return res.response(200, "The OTP code sent to your email");
}, res);


// CONFIRM EMAIL ADDRESS
const confirmEmail = (req, res) => tryCatch(async () => {
    // destructure request body
    const { email, otp } = req.body;

    // try verifying the otp
    const { status, message } = await Verification.verify(email, otp, {
        onSuccess: "Signup successfully", isSignupEmailConfirmation: true,
    });

    // return back with status and message
    return res.response(status, message);
}, res);


// SIGIN FOR SUPERVISOR AND STUDENT
const signin = (req, res) => tryCatch(async () => {
    // destructure request body
    const { username, password } = req.body;

    // construct query to match any user
    const query = { $or: [{ email: username }, { phone: username }, { cnic: username }, { rollNo: username }] }

    // retrieve user by phone|email|nic|rollNo 
    let user = await userService.retrieveOne(query, { withPassword: true });

    // return back with access denied response whether user is not found or password is invalid
    if (!user || !(await user.comparePassword(password))) {
        return res.response(403, "Invalid username or password");
    }
    // return back with access denied response if user status is not active
    if (user.status !== "active") {
        return res.response(403, "Account is not active");
    }

    // generate jwt token with user ID payload, expiring in 7 days
    const token = user.generateToken("7d");

    // return back with success response containing user and token
    return res.response(200, "Signin successfully", { user, token });
}, res);


// RESET PASSWORD FOR SUPERVISOR AND STUDENT
const resetPassword = (req, res) => tryCatch(async () => {
    // destructure request body
    const { password } = req.body;

    // valiate and decode token
    const { id } = await validateAndDecodeToken(req.headers.token);

    // retrieve user by user ID extracted from token; return back with user not found response if unavailable
    const user = await userService.retrieveOne({ _id: id });
    if (!user) return res.response(403, "Unauthenticated");

    // throw error when password reset was unsuccessfull
    if (!(await userService.update({ _id: user._id }, { password }))) {
        throw new Error("The internal server error");
    }

    // return back with success response
    return res.response(200, "Password reset successfully");
}, res);


// VERIFY OTP
const verifyOTP = (req, res) => tryCatch(async () => {
    // destructure request body
    const { email, otp } = req.body;

    // try verifying the otp
    const { status, message } = await Verification.verify(email, otp, {
        onSuccess: "The OTP code verified successfully"
    });

    // return back with error status and message
    if (status !== 200) return res.response(status, message);

    // retrieve user by email 
    const user = await userService.retrieveOne({ email });
    if (!user) return re.response(404, "Failed to verify OTP code");

    // generate jwt token with user ID payload, expiring in 15 minutes
    const token = user.generateToken("900s");

    // return back with success response containing token
    return res.response(200, message, { token });
}, res);

// SENT OTP
const sendOTP = (req, res) => tryCatch(async () => {
    // destructure request body
    const { email: otpEmail, subject, sendViaWhatsApp } = req.body;

    // retrieve user to check whether it exists or not
    const user = await userService.retrieveOne({ email: otpEmail });
    if (!user) return res.response(404, "No account match found");

    // generate random OTP of 6 digits
    const generatedOtp = await Verification.generate(otpEmail, 5);

    // email options
    const options = {
        template: "otp.email",
        user: user.name.capEach(),
        subject: subject ?? "OTP Verification",
        otp: generatedOtp
    };

    // send email with OTP and check if it was sent othwerwise throw failed to send email error
    // email.send(otpEmail, options);
    if (!(await email.send(otpEmail, options))) {
        throw new Error("Failed to send OTP code");
    }

    // return back with success response
    return res.response(200, "The OTP code sent to your email");
}, res);

// VERIFY TOKEN
const verifyToken = (req, res) => tryCatch(async () => {
    // return back with success response
    return res.response(200, "Token verified", { user: req.user });
}, res);

export default { signup, confirmEmail, signin, resetPassword, verifyOTP, sendOTP, verifyToken }