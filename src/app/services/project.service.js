import tryCatch from '../../utils/libs/helper/try.catch.js';
import populateOptions from '../../utils/constants/populate.options.js';
import validateParameter from '../../utils/libs/helper/validate.parameter.js';
import validateMongooseObjectId from '../../utils/libs/database/validate.mongoose.object.id.js';
import Project from '../models/project.model.js';
import constructQuery from '../../utils/libs/database/construct.query.js';
import pagination from '../../utils/libs/database/pagination.js';
import createMongooseObjectId from '../../utils/libs/database/create.mongoose.object.id.js';

// function to retrieve all project documents
const retrieveAll = async ({ query = {}, current = 1, size = 10, sort = {} } = {}) => tryCatch(async () => {
    // constuct the query to search on fields
    const searchQuery = constructQuery(query, true);

    // retrieve documents with pagination
    return await pagination(Project, { query: searchQuery, current, size, sort }, {
        populate: populateOptions.project
    });
});

// function to retrieve many project documents related to any query
const retrieveMany = async (roleId, { query = {}, current = 1, size = 10, sort = {} } = {}) => tryCatch(async () => {
    // constuct the query to search on fields
    const searchQuery = constructQuery(query, true);

    // merge queries to retrieve specified documents
    const finalQuery = { $and: [{ supervisor: createMongooseObjectId(roleId) }, searchQuery] };

    // retrieve documents with pagination
    return await pagination(Project, { query: finalQuery, current, size, sort }, {
        populate: populateOptions.project
    });
});

// function to retrieve single specified project document
const retrieveOne = async (queryId) => {
    let query;
    if (typeof queryId === "object") {
        // extract query key
        const key = Object.keys(queryId)[0]

        // convert ID string to mongoose ObjectId
        query = { [key]: createMongooseObjectId(queryId[key]) };
    } else {
        // convert ID string to mongoose ObjectId
        const id = createMongooseObjectId(queryId);

        // construct the query to match proposal with any of the following fields
        query = { $or: [{ _id: id }, { lead: id }, { memberOne: id }, { memberTwo: id }] }
    }

    // return retrieved project document or null
    return await tryCatch(() => Project.findOne(query)
        .populate(populateOptions.project)
    );
};

// function to create a new project document
const create = async (data) => {
    // validate query 
    validateParameter('object', data);

    // return newly created project document
    return await tryCatch(async () => {
        return (await Project.create(data))
            .populate(populateOptions.project);
    });
};

// function to update specified project document
const update = async (query, data) => {
    // validate query and data
    validateParameter('object', query, data);

    // attempt to update and return updated document
    return await tryCatch(() => {
        return Project.findOneAndUpdate(query, data, { new: true })
            .populate(populateOptions.project);
    });
};

// method to delete single specified project document
const del = async (id) => {
    // validate id is a valid mongoose ID
    validateMongooseObjectId(id);

    // delete and return deleted project document
    return await tryCatch(() => {
        return Project.findByIdAndDelete(id)
            .populate(populateOptions.project);
    });
};

export default { retrieveAll, retrieveMany, retrieveOne, create, update, delete: del };