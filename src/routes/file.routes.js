import { Router } from "express";

import fileController from "../app/controllers/file.controller.js";
import auth from "../app/middlewares/auth.js";

const fileRoutes = Router({ mergeParams: true });

// serve file to the frontend
fileRoutes.get('/:directoryName/:fileName',
    auth.authenticate, // middleware to authenticate request user based on JWT token
    auth.authorize("*"),  // middleware to authorize role(s) to access the route
    fileController.serve // controller method to serve privately stored files
);

export default fileRoutes;