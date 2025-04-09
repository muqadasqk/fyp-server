import { Router } from "express";

import userController from "../app/controllers/user.controller.js";
import validateUser from "../app/middlewares/validate/validate.user.js";
import file from "../app/middlewares/file.js";
import form from "../app/middlewares/form.js";
import auth from "../app/middlewares/auth.js";

const userRoutes = Router({ mergeParams: true });

// retrieve all user documents
userRoutes.post('/all',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("admin"), // middleware to authorize role(s) to access the route
    userController.index // controller method to retrieve all user docuements
);

// single user document by id
userRoutes.get('/:userId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("admin"), // middleware to authorize role(s) to access the route
    userController.show // controller method to retrieve one specified user documents
);

// route to create a new user document
userRoutes.post('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("admin"), // middleware to authorize role(s) to access the route
    file.save('image'), // middleware to save image file
    form.sanitize, // middleware to sanitize input fields
    validateUser.createForm, // middleware to enforce certain validations on input fields
    userController.create // controller method to create a new user document
);

// update user document
userRoutes.patch('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("*"), // middleware to authorize role(s) to access the route
    file.save('image'), // middleware to save image file
    form.sanitize, // middleware to sanitize input fields
    validateUser.updateForm, // middleware to enforce certain validations on input fields
    userController.update // controller method to handle bussiness logic to update user document with certain fields
);

// delete user document by id
userRoutes.delete('/:userId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("admin"), // middleware to authorize role(s) to access the route
    userController.delete // controller method to handle bussiness logic for deleting a user document
);

// update user password
userRoutes.patch('/update-password',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("*"), // middleware to authorize role(s) to access the route
    file.none,  // enable route to access request body fields
    form.sanitize, // middleware to sanitize input fields
    validateUser.updatePasswordForm, // middleware to enforce certain validations on input fields
    userController.updatePassword // controller method to handle resest password bussiness logic
);

// update user status by id
userRoutes.patch('/:userId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("admin"), // middleware to authorize role(s) to access the route
    file.none, // middleware to save image file
    form.sanitize, // middleware to sanitize input fields
    validateUser.updateStatusForm, // middleware to enforce certain validations on input fields
    userController.updateStatus // controller method to handle bussiness logic to update user status
);

export default userRoutes;