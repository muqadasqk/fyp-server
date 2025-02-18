import { Router } from "express";

import progressController from "../app/controllers/progress.controller.js";
import validateProgress from "../middlewares/validate/validate.progress.js";
import file from "../middlewares/file.js";
import form from "../middlewares/form.js";
import auth from "../middlewares/auth.js";

const progressRoutes = Router({ mergeParams: true });

// retrieve all progress documents
progressRoutes.get('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    progressController.index // controller method to retrieve all progress docuements
);

// project related progress documents against project id
progressRoutes.get('/project/:projectId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    progressController.projectProgresses // controller method to retrieve specified progress docuement
);

// single progress document against id
progressRoutes.get('/:progressId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    progressController.show // controller method to retrieve specified progress docuement
);

// create new progress document
progressRoutes.post('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.is.student, // ensure the request user is not student
    file.save('resource'), // middleware to save resource file
    form.sanitize, // middleware to sanitize input fields
    validateProgress.createForm, // middleware to enforce certain validations on input fields
    progressController.create // controller method to handle bussiness logic to create a new progress document
);

// update progress document against id
progressRoutes.patch('/:progressId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    file.save('resource'), // middleware to save resource file
    form.sanitize,  // middleware to sanitize input fields
    validateProgress.updateForm, // middleware to enforce certain validations on input fields
    progressController.update // controller method to handle bussiness logic to update progress document with certain fields
);

// delete progress document against id
progressRoutes.delete('/:progressId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.not.supervisor, // middleware to ensure request user is not supervisor
    progressController.delete // controller method to handle bussiness logic to update progress document with certain fields
);

export default progressRoutes;