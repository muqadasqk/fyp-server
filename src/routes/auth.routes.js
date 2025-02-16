import { Router } from 'express'

import authController from '../app/controllers/auth.controller.js';
import validateAuth from '../middlewares/validate/validate.auth.js';
import file from '../middlewares/file.js';
import form from '../middlewares/form.js';

const authRoutes = Router({ mergeParams: true });

// route to register a new user 
authRoutes.post('/signup',
    file.save('image'), // middleware to save image file
    form.sanitize, // middleware to sanitize input fields
    validateAuth.signupForm, // middleware to enforce certain validations on input fields
    authController.signup // perform user registration
);

// route to verify newly registered user's email address
authRoutes.post('/verify-email',
    file.none, // enable route to access request body fields
    form.sanitize, // middleware to sanitize input fields
    validateAuth.verifyOTPForm, // middleware to enforce certain validations on input fields
    authController.verifyEmail // perform email verification
);

// route to let supervisor/student get login
authRoutes.post('/signin',
    file.none, // enable route to access request body fields
    form.sanitize, // middleware to sanitize input fields
    validateAuth.signinForm, // middleware to enforce certain validations on input fields
    authController.signin  // attempt to signin user
);

// route to let admin get login
authRoutes.post('/admin/signin',
    file.none, // enable route to access request body fields
    form.sanitize,  // middleware to sanitize input fields
    validateAuth.adminSigninForm, // middleware to enforce certain validations on input fields
    authController.adminSignin // attempt to authorize admin
);

// route to reset forgotten password
authRoutes.patch('/reset-password/:token',
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

// route to resend OTP
authRoutes.post('/send-otp',
    file.none, // enable route to access request body fields
    form.sanitize,  // middleware to sanitize input fields
    validateAuth.sendOTPForm, // middleware to enforce certain validations on input fields
    authController.sendOTP // execute to send OTP via email
);

export default authRoutes;