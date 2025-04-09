import { Router } from 'express'

import authController from '../app/controllers/auth.controller.js';
import validateAuth from '../app/middlewares/validate/validate.auth.js';
import auth from "../app/middlewares/auth.js";
import file from '../app/middlewares/file.js';
import form from '../app/middlewares/form.js';

const authRoutes = Router({ mergeParams: true });

// route to register a new user 
authRoutes.post('/signup',
    file.save("image"), // middleware to save image file
    form.sanitize, // middleware to sanitize input fields
    validateAuth.signupForm, // middleware to enforce certain validations on input fields
    authController.signup // perform user registration
);

// route to verify newly registered user's email address
authRoutes.post('/confirm-email',
    file.none, // enable route to access request body fields
    form.sanitize, // middleware to sanitize input fields
    validateAuth.verifyOTPForm, // middleware to enforce certain validations on input fields
    authController.confirmEmail // perform email confirmation
);

// route to let supervisor/student get login
authRoutes.post('/signin',
    file.none, // enable route to access request body fields
    form.sanitize, // middleware to sanitize input fields
    validateAuth.signinForm, // middleware to enforce certain validations on input fields
    authController.signin  // attempt to signin user
);

// route to reset forgotten password
authRoutes.patch('/reset-password',
    file.none,// enable route to access request body fields 
    form.sanitize,  // middleware to sanitize input fields
    validateAuth.resetPasswordForm, // middleware to enforce certain validations on input fields
    authController.resetPassword // perform reseting password
);

// route to verify OTP sent to email
authRoutes.post('/verify-otp',
    file.none, // enable route to access request body fields
    form.sanitize, // middleware to sanitize input fields
    validateAuth.verifyOTPForm, // middleware to enforce certain validations on input fields
    authController.verifyOTP // perform OTP verification
);

// route to send OTP
authRoutes.post('/send-otp',
    file.none, // enable route to access request body fields
    form.sanitize,  // middleware to sanitize input fields
    validateAuth.sendOTPForm, // middleware to enforce certain validations on input fields
    authController.sendOTP // execute to send OTP via email
);

// route to verify token
authRoutes.get('/verify-token',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("*"), // middleware to allow specified role(s) only 
    authController.verifyToken // controller method to handle verify token logic
);

export default authRoutes;