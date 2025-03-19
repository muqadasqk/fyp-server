import { Router } from "express";

import meetingController from "../app/controllers/meeting.controller.js";
import validateProgress from "../app/middlewares/validate/validate.meeting.js";
import file from "../app/middlewares/file.js";
import form from "../app/middlewares/form.js";
import auth from "../app/middlewares/auth.js";

const meetingRoutes = Router({ mergeParams: true });

// retrieve all meeting documents
meetingRoutes.get('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    meetingController.index // controller method to retrieve all meeting docuements
);

// project related meeting documents against project id
meetingRoutes.get('/project/:projectId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    meetingController.projectMeetings // controller method to retrieve specified meeting docuement
);

// single meeting document against id
meetingRoutes.get('/:meetingId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    meetingController.show // controller method to retrieve specified meeting docuement
);

// create new meeting document
meetingRoutes.post('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.is.supervisor, // ensure the request user is supervisor
    file.none, // middleware to save resource file
    form.sanitize, // middleware to sanitize input fields
    validateProgress.createForm, // middleware to enforce certain validations on input fields
    meetingController.create // controller method to handle bussiness logic to create a new meeting document
);

// update meeting document against id
meetingRoutes.patch('/:meetingId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.is.supervisor, // ensure the request user is supervisor
    file.none, // middleware to save resource file
    form.sanitize,  // middleware to sanitize input fields
    validateProgress.updateForm, // middleware to enforce certain validations on input fields
    meetingController.update // controller method to handle bussiness logic to update meeting document with certain fields
);

// delete meeting document against id
meetingRoutes.delete('/:meetingId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.not.student, // middleware to ensure request user is not student
    meetingController.delete // controller method to handle bussiness logic to update meeting document with certain fields
);

export default meetingRoutes;