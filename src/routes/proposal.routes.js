import { Router } from "express";

import proposalController from "../app/controllers/proposal.controller.js";
import validateProposal from "../middlewares/validate/validate.proposal.js";
import file from "../middlewares/file.js";
import form from "../middlewares/form.js";
import auth from "../middlewares/auth.js";

const proposalRoutes = Router({ mergeParams: true });

// retrieve all proposal documents
proposalRoutes.get('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    proposalController.index // controller method to retrieve all proposal docuements
);

// single proposal document against id
proposalRoutes.get('/:proposalId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    proposalController.show // controller method to retrieve specified proposal docuement
);

// create new proposal document
proposalRoutes.post('/',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.is.student, // ensure the request user is student
    file.none, // middleware to save resource file
    form.sanitize, // middleware to sanitize input fields
    validateProposal.createForm, // middleware to enforce certain validations on input fields
    proposalController.create // controller method to handle bussiness logic to create a new proposal document
);

// update proposal document against id
proposalRoutes.patch('/:proposalId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.is.admin, // ensure the request user is admin
    file.none, // middleware to save resource file
    form.sanitize,  // middleware to sanitize input fields
    validateProposal.updateForm, // middleware to enforce certain validations on input fields
    proposalController.update // controller method to handle bussiness logic to update proposal document with certain fields
);

// delete proposal document against id
proposalRoutes.delete('/:proposalId',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.is.admin, // middleware to ensure request user is not supervisor
    proposalController.delete // controller method to handle bussiness logic to update proposal document with certain fields
);

export default proposalRoutes;