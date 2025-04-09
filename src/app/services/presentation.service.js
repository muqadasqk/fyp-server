import tryCatch from '../../utils/libs/helper/try.catch.js';
import populateOptions from '../../utils/constants/populate.options.js';
import validateParameter from '../../utils/libs/helper/validate.parameter.js';
import validateMongooseObjectId from '../../utils/libs/database/validate.mongoose.object.id.js';
import projectService from './project.service.js';
import Presentation from '../models/presentation.model.js';
import constructQuery from '../../utils/libs/database/construct.query.js';
import pagination from '../../utils/libs/database/pagination.js';
import Project from '../models/project.model.js';
import createMongooseObjectId from '../../utils/libs/database/create.mongoose.object.id.js';

// function to retrieve all presentation documents
const retrieveAll = async (requestUser, { query = {}, current = 1, size = 10, sort = {} } = {}) => tryCatch(async () => {
    // constuct the query to search on fields
    const searchQuery = constructQuery(query, true);

    // user related query construct
    let userQuery = {};
    switch (requestUser.role) {
        case "supervisor": {
            // retrieve all request supervisor projects
            const projectIds = (await Project.find({ supervisor: requestUser._id })).map((project) => project?._id);

            // construct query of consiting request supervisor projects IDs
            userQuery = { project: { $in: projectIds } }; break;
        }

        case "student": {
            // convert ID string to mongoose ObjectId
            const id = createMongooseObjectId(requestUser._id);

            // construct the query to match proposal with any of the following fields
            const refQuery = { $or: [{ lead: id }, { memberOne: id }, { memberTwo: id }] }

            // construct query of consiting request student project ID
            userQuery = { project: (await projectService.retrieveOne(refQuery))?._id }; break;
        }
    }

    // constructor final query
    const finalQuery = { $and: [userQuery, searchQuery] };

    // retrieve documents with pagination
    return await pagination(Presentation, { query: finalQuery, current, size, sort }, {
        populate: populateOptions.presentation
    });
});

// function to retrieve all presentation documents related to specific reference
const retrieveMany = async (refId, { query = {}, current = 1, size = 10, sort = {} } = {}) => tryCatch(async () => {
    // constuct the query to search on fields
    const searchQuery = constructQuery(query, true);

    // constructor final query
    const finalQuery = { $and: [{ project: createMongooseObjectId(refId) }, searchQuery] };

    // retrieve documents with pagination
    return await pagination(Presentation, { query: finalQuery, current, size, sort }, {
        populate: populateOptions.presentation
    });
});

// function to retrieve single specified presentation document
const retrieveOne = async (queryId, extraQuery = null) => {
    let query;
    if (typeof queryId === "object") {
        // extract query key
        const key = Object.keys(queryId)[0]

        // convert ID string to mongoose ObjectId
        query = { [key]: createMongooseObjectId(queryId[key]) };
    } else {
        // convert ID string to mongoose ObjectId
        query = { _id: createMongooseObjectId(queryId) };
    }

    // merging the queries
    if (extraQuery) (query = { $and: [query, extraQuery] })

    // return retrieved presentation document or null
    return await tryCatch(() => {
        return Presentation.findOne(query)
            .populate(populateOptions.presentation);
    });
};

// function to create a new presentation document
const create = async (data) => {
    // validate query 
    validateParameter('object', data);

    // return newly created presentation document
    return await tryCatch(async () => {
        return (await Presentation.create(data))
            .populate(populateOptions.presentation);
    });
};

// function to update specified presentation document
const update = async (query, data) => {
    // validate query and data
    validateParameter('object', query, data);

    // attempt to update and retrieve updated document
    return await tryCatch(() => {
        return Presentation.findOneAndUpdate(query, data, { new: true })
            .populate(populateOptions.presentation);
    });
};

// method to delete single specified presentation document
const del = async (_id) => {
    // delete and retrieve deleted presentation document
    return await tryCatch(() => {
        return Presentation.findByIdAndDelete(_id)
            .populate(populateOptions.presentation);
    });
};

export default { retrieveAll, retrieveMany, retrieveOne, create, update, delete: del };