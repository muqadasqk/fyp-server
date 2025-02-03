import { createFilter, input, getPaginationMetadata, retrieveDocuments, str, tryCatch, validateMongoObjectID, defaultPaginationMetadata } from '../../utils/functions.js';
import progress from '../models/progress.js';
import file from '../../middlewares/file.js';
import populateOptions from '../../utils/constants/populate.options.js';
import userrole from '../../utils/constants/user.role.js';
import project from '../models/project.js';
import projectService from './project.service.js';

// function to retrieve all progress documents
const retrieveAll = async ({ userID, userRole }, { query, page, limit }) => tryCatch(async () => {
    // initialize user query object to retrieve request user specific progress documents
    const userQuery = {}

    // if request user is supervisor
    if (userRole === userrole.SUPERVISOR) {
        // retrieve all request supervsor specific project IDs as valid mongoose ObjectIds
        const projects = await project.find({ supervisor: userID });

        // if there is not any projects specific to request supervisor return an empty arrray
        if (!projects) return { progresses: [], metadata: defaultPaginationMetadata({ page, limit }) };

        // build a query to retrieve only progress documents related to retrieved project documents IDS
        userQuery.project = { $in: projects.map(project => project._id) };
    }

    // if request user is student
    if (userRole === userrole.STUDENT) {
        // create query to retrieve project document to retrieve its specific progress documents only
        const retrieveProjectQuery = createFilter(userID.toString(), ['lead', 'memberOne', 'memberTwo'], {
            mongooseId: true
        });

        // retrieve their specific project
        const retrievedProject = await projectService.retrieveOne(retrieveProjectQuery);

        // if there is not any project specific to request student return an empty arrray
        if (!retrievedProject) return { progresses: [], metadata: defaultPaginationMetadata({ page, limit }) };

        // build a query to retrieve only progress documents related to retrieved project document
        userQuery.project = retrievedProject._id;
    }

    // create filter to match fields with query string
    const filterQuery = createFilter(query, ['summary', 'session', 'status', 'remarks']);

    const formedQuery = { $and: [userQuery, filterQuery] };

    // obtain pagination info
    const pagination = await getPaginationMetadata(progress, formedQuery, { page, limit });

    // retrieve progress documents according to query, page and limit
    const progresses = await retrieveDocuments(progress, formedQuery, { page, limit, populate: 'progress' });

    // return object containing document and pagination info
    return { progresses, metadata: pagination };
});

// function to retrieve single specified progress document
const retrieveOne = async query => {
    // validate query is proper object
    input.validate(query, 'object');

    // return retrieved progress document or null
    return await tryCatch(() => {
        return progress.findOne(query).populate(populateOptions.progress);
    });
};

// function to create a new progress document
const create = async (data) => {
    // validate query is proper object
    input.validate(data, 'object');

    // return newly created progress document
    return await tryCatch(async () => {
        return (await progress.create(data)).populate(populateOptions.progress);
    });
};

// function to update specified progress document
const update = async (query, data) => {
    // validate query and data are proper object
    input.validate(data, 'object');
    input.validate(query, 'object');

    // attempt to update and retrieve old document
    const updated = await tryCatch(() => {
        return progress.findOneAndUpdate(query, data, { new: false }).populate(populateOptions.progress);
    });

    // delete old resource file if there was a new image uploaded 
    if (updated && data.resource) {
        file.delete(updated.resource);
    }

    // return old document before update was made
    return updated;
};

// method to delete single specified progress document
const del = async id => {
    // validate id is a valid mongoose ID
    validateMongoObjectID(id);

    // delete and retrieve deleted progress document
    const deleted = await tryCatch(() => {
        return progress.findByIdAndDelete(id).populate(populateOptions.progress);
    });

    // delete old proposal file when progress document deletion was successful
    if (deleted && deleted.resource) {
        file.delete(deleted.resource);
    }

    // return deleted progress document
    return deleted;
};

export default { retrieveAll, retrieveOne, create, update, delete: del };