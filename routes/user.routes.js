import { Router } from "express";
import userController from "../app/controllers/user.controller.js";
import file from "../middlewares/file.js";
import form from "../middlewares/form.js";
import auth from "../middlewares/auth.js";
import validateUser from "../middlewares/validate/validate.user.js";

const userRoutes = Router({ mergeParams: true });

// retrieve all user documents
userRoutes.get('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.not.student, // middleware to ensure request user is not student
    userController.index // controller method to retrieve all user docuements
);

// single user document by id
userRoutes.get('/:userId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.not.student, // middleware to ensure request user is not student
    userController.show // controller method to retrieve one specified user documents
);

// route to create a new user document
userRoutes.post('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.not.student, // the request user must be either admin or supervisor
    file.save('image'), // middleware to save image file
    form.sanitize, // middleware to sanitize input fields
    validateUser.createForm, // middleware to enforce certain validations on input fields
    userController.create // controller method to create a new user document
);

// udate user document by id
userRoutes.patch('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    file.save('image'), // middleware to save image file
    form.sanitize, // middleware to sanitize input fields
    validateUser.updateForm, // middleware to enforce certain validations on input fields
    userController.update // controller method to handle bussiness logic to update user document with certain fields
);

// delete user document by id
userRoutes.delete('/:userId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.is.admin, // middleware to ensure request user is admin
    userController.delete // controller method to handle bussiness logic for deleting a user document
);

// update user document by id
userRoutes.patch('/update-password',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    file.none,  // enable route to access request body fields
    form.sanitize, // middleware to sanitize input fields
    validateUser.updatePasswordForm, // middleware to enforce certain validations on input fields
    userController.updatePassword // controller method to handle resest password bussiness logic
);

export default userRoutes;