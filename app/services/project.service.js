import { createFilter, input, paginationInfo, retrieveDocuments, tryCatch, validateMongoObjectID } from '../../utils/functions.js';
import project from '../models/project.js';
import file from '../../middlewares/file.js';
import populateOptions from '../../utils/constants/populate.options.js';

// function to retrieve all project documents
const all = async ({ query, page, limit }) => {
    // create filter to match fields with query string
    const filter = createFilter(query, ['title', 'abstract', 'status']);

    // retrieve project documents an pagination info and return an object
    return await tryCatch(async () => {
        // obtain pagination info
        const pagination = await paginationInfo(project, filter, { page, limit });

        // retrieve project documents according to query, page and limit
        const projects = await retrieveDocuments(project, filter, { page, limit, populate: 'project' });

        // return object containing document and pagination info
        return { projects, page: pagination }
    });
};

// function to retrieve single specified project document
const one = async query => {
    // validate query is proper object
    input.validate(query, 'object');

    // return retrieved project document or null
    return await tryCatch(() => {
        return project.findOne(query).populate(populateOptions.project);
    });
};

// function to create a new project document
const create = async (data) => {
    // validate query is proper object
    input.validate(data, 'object');

    // return newly created project document
    return await tryCatch(async () => {
        return (await project.create(data)).populate(populateOptions.project);
    });
};

// function to update specified project document
const update = async (query, data) => {
    // validate query and data are proper object
    input.validate(data, 'object');
    input.validate(query, 'object');

    // attempt to update and retrieve old document
    const updated = await tryCatch(() => {
        return project.findOneAndUpdate(query, data, { new: false }).populate(populateOptions.project);
    });

    // delete old proposal file if there was a new image uploaded 
    if (updated && data.proposal) {
        file.delete(updated.proposal);
    }

    // return old document before update was made
    return updated;
};

// method to delete single specified project document
const del = async id => {
    // validate id is a valid mongoose ID
    validateMongoObjectID(id);

    // delete and retrieve deleted project document
    const deleted = await tryCatch(() => {
        return project.findByIdAndDelete(id).populate(populateOptions.project);
    });

    // delete old proposal file when project document deletion was successful
    if (deleted && deleted.proposal) {
        file.delete(deleted.proposal)
    }

    // return deleted project document
    return deleted;
};

export default { all, one, create, update, delete: del };