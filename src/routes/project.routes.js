import { Router } from "express";

import projectController from "../app/controllers/project.controller.js";
import validateProject from "../middlewares/validate/validate.project.js";
import file from "../middlewares/file.js";
import form from "../middlewares/form.js";
import auth from "../middlewares/auth.js";

const projectRoutes = Router({ mergeParams: true });

// retrieve all project documents
projectRoutes.get('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.is.admin, // middleware to ensure request user is an admin
    projectController.index // controller method to retrieve all project docuements
);

// supervisor project documents against supervisor id
projectRoutes.get('/supervisor/:supervisorId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.not.student, // middleware to ensure request user is an admin
    projectController.supervisorProjects // controller method to retrieve specified project docuement
);

// single project document against id
projectRoutes.get('/:projectId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    projectController.show // controller method to retrieve specified project docuement
);

// create new project document
projectRoutes.post('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.is.admin, // ensure the request user is student
    file.save('proposal'), // middleware to save proposal file
    form.sanitize, // middleware to sanitize input fields
    validateProject.createForm, // middleware to enforce certain validations on input fields
    projectController.create // controller method to handle bussiness logic to create a new project document
);

// update project document against id
projectRoutes.patch('/:projectId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    file.save('proposal'), // middleware to save proposal file
    form.sanitize,  // middleware to sanitize input fields
    validateProject.updateForm, // middleware to enforce certain validations on input fields
    projectController.update // controller method to handle bussiness logic to update project document with certain fields
);

// delete project document against id
projectRoutes.delete('/:projectId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.is.admin, // middleware to ensure request user is an admin
    projectController.delete // controller method to handle bussiness logic to update project document with certain fields
);

export default projectRoutes;