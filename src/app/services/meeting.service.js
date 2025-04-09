import tryCatch from '../../utils/libs/helper/try.catch.js';
import populateOptions from '../../utils/constants/populate.options.js';
import validateParameter from '../../utils/libs/helper/validate.parameter.js';
import validateMongooseObjectId from '../../utils/libs/database/validate.mongoose.object.id.js';
import projectService from './meeting.service.js';
import createMongooseObjectId from '../../utils/libs/database/create.mongoose.object.id.js';
import pagination from '../../utils/libs/database/pagination.js';
import Project from '../models/project.model.js';
import constructQuery from '../../utils/libs/database/construct.query.js';
import Meeting from '../models/meeting.model.js';

// function to retrieve all meeting documents
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
    return await pagination(Meeting, { query: finalQuery, current, size, sort }, {
        populate: populateOptions.meeting
    });
});

// function to retrieve all meeting documents related to specific reference
const retrieveMany = async (refId, { query = {}, current = 1, size = 10, sort = {} } = {}) => tryCatch(async () => {
    // constuct the query to search on fields
    const searchQuery = constructQuery(query, true);

    // constructor final query
    const finalQuery = { $and: [{ project: createMongooseObjectId(refId) }, searchQuery] };

    // retrieve documents with pagination
    return await pagination(Meeting, { query: finalQuery, current, size, sort }, {
        populate: populateOptions.meeting
    });
});

// function to retrieve single specified meeting document
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
        return Meeting.findOne(query)
            .populate(populateOptions.presentation);
    });
};


// function to create a new meeting document
const create = async (data) => {
    // validate query 
    validateParameter('object', data);

    // return newly created meeting document
    return await tryCatch(async () => {
        return (await Meeting.create(data))
            .populate(populateOptions.meeting);
    });
};

// function to update specified meeting document
const update = async (meetingId, data) => {
    // construct query 
    const query = { _id: createMongooseObjectId(meetingId) };

    // validate query and data
    validateParameter('object', data);

    // attempt to update and return old document
    return await tryCatch(() => {
        return Meeting.findOneAndUpdate(query, data, { new: true })
            .populate(populateOptions.meeting);
    });
};

// method to delete single specified meeting document
const del = async (meetingId) => {
    // validate id is a valid mongoose ID
    validateMongooseObjectId(meetingId);

    // delete and return deleted meeting document
    return await tryCatch(() => {
        return Meeting.findByIdAndDelete(meetingId)
            .populate(populateOptions.meeting);
    });
};

export default { retrieveAll, retrieveMany, retrieveOne, create, update, delete: del };