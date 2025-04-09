import { Router } from "express";

import proposalController from "../app/controllers/proposal.controller.js";
import validateProposal from "../app/middlewares/validate/validate.proposal.js";
import file from "../app/middlewares/file.js";
import form from "../app/middlewares/form.js";
import auth from "../app/middlewares/auth.js";

const proposalRoutes = Router({ mergeParams: true });

// retrieve all proposal documents
proposalRoutes.post('/all',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("*"),  // middleware to authorize role(s) to access the route
    proposalController.index // controller method to retrieve all proposal docuements
);

// single proposal document against id
proposalRoutes.get('/:proposalId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("*"),  // middleware to authorize role(s) to access the route
    proposalController.show // controller method to retrieve specified proposal docuement
);

// create new proposal document
proposalRoutes.post('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("student"),  // middleware to authorize role(s) to access the route
    file.none, // middleware to save resource file
    form.sanitize, // middleware to sanitize input fields
    validateProposal.createForm, // middleware to enforce certain validations on input fields
    proposalController.create // controller method to handle bussiness logic to create a new proposal document
);

// update proposal document against id
proposalRoutes.patch('/:proposalId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("admin"),  // middleware to authorize role(s) to access the route
    file.none, // middleware to save resource file
    form.sanitize,  // middleware to sanitize input fields
    validateProposal.updateForm, // middleware to enforce certain validations on input fields
    proposalController.update // controller method to handle bussiness logic to update proposal document with certain fields
);

// delete proposal document against id
proposalRoutes.delete('/:proposalId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("admin", "student"),  // middleware to authorize role(s) to access the route
    proposalController.delete // controller method to handle bussiness logic to update proposal document with certain fields
);

export default proposalRoutes;