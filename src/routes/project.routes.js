import { Router } from "express";

import projectController from "../app/controllers/project.controller.js";
import validateProject from "../app/middlewares/validate/validate.project.js";
import file from "../app/middlewares/file.js";
import form from "../app/middlewares/form.js";
import auth from "../app/middlewares/auth.js";

const projectRoutes = Router({ mergeParams: true });

// retrieve all project documents
projectRoutes.post('/all',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("admin"),  // middleware to authorize role(s) to access the route
    projectController.index // controller method to retrieve all project docuements
);

// supervisor project documents against supervisor id
projectRoutes.post('/s/:supervisorId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("admin", "supervisor"),  // middleware to authorize role(s) to access the route
    projectController.supervisorProjects // controller method to retrieve specified project docuement
);

// single project document against id
projectRoutes.get('/:projectId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("*"),  // middleware to authorize role(s) to access the route  
    projectController.show // controller method to retrieve specified project docuement
);

// create new project document
projectRoutes.post('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("admin"),  // middleware to authorize role(s) to access the route
    file.save('proposal'), // middleware to save proposal file
    form.sanitize, // middleware to sanitize input fields
    validateProject.createForm, // middleware to enforce certain validations on input fields
    projectController.create // controller method to handle bussiness logic to create a new project document
);

// update project document against id
projectRoutes.patch('/:projectId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("*"),  // middleware to authorize role(s) to access the route
    file.save('proposal'), // middleware to save proposal file
    form.sanitize,  // middleware to sanitize input fields
    validateProject.updateForm, // middleware to enforce certain validations on input fields
    projectController.update // controller method to handle bussiness logic to update project document with certain fields
);

// delete project document against id
projectRoutes.delete('/:projectId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("admin"),  // middleware to authorize role(s) to access the route
    projectController.delete // controller method to handle bussiness logic to update project document with certain fields
);

export default projectRoutes;