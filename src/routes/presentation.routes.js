import { Router } from "express";

import presentationController from "../app/controllers/presentation.controller.js";
import validateProgress from "../middlewares/validate/validate.presentation.js";
import file from "../middlewares/file.js";
import form from "../middlewares/form.js";
import auth from "../middlewares/auth.js";

const presentationRoutes = Router({ mergeParams: true });

// retrieve all presentation documents
presentationRoutes.get('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    presentationController.index // controller method to retrieve all presentation docuements
);

// project related presentation documents against project id
presentationRoutes.get('/project/:projectId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    presentationController.projectProgresses // controller method to retrieve specified presentation docuement
);

// single presentation document against id
presentationRoutes.get('/:presentationId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    presentationController.show // controller method to retrieve specified presentation docuement
);

// create new presentation document
presentationRoutes.post('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.is.student, // ensure the request user is not student
    file.save('resource'), // middleware to save resource file
    form.sanitize, // middleware to sanitize input fields
    validateProgress.createForm, // middleware to enforce certain validations on input fields
    presentationController.create // controller method to handle bussiness logic to create a new presentation document
);

// update presentation document against id
presentationRoutes.patch('/:presentationId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    file.save('resource'), // middleware to save resource file
    form.sanitize,  // middleware to sanitize input fields
    validateProgress.updateForm, // middleware to enforce certain validations on input fields
    presentationController.update // controller method to handle bussiness logic to update presentation document with certain fields
);

// delete presentation document against id
presentationRoutes.delete('/:presentationId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.not.supervisor, // middleware to ensure request user is not supervisor
    presentationController.delete // controller method to handle bussiness logic to update presentation document with certain fields
);

export default presentationRoutes;