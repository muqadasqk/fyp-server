import tryCatch from '../../utils/libs/helper/try.catch.js';
import buildMongoQuery from '../../utils/libs/database/build.mongo.query.js';
import populateOptions from '../../utils/constants/populate.options.js';
import calculatePaginationMetadata from '../../utils/libs/database/calculate.pagination.metadata.js';
import readDatabase from '../../utils/libs/database/read.database.js';
import validateParameter from '../../utils/libs/helper/validate.parameter.js';
import validateMongooseObjectId from '../../utils/libs/database/validate.mongoose.object.id.js';
import progress from '../models/progress.js';
import file from '../../middlewares/file.js';
import userRole from '../../utils/constants/user.role.js';
import projectService from './project.service.js';

// function to retrieve all progress documents
const retrieveAll = async (requestUser, options = {}) => {
    // destructure options
    const { searchQuery, currentPage, documentCount } = options;

    // initialize query
    let projectQuery = {};
    let query = {};

    // create query to filter documents
    const filter = buildMongoQuery({
        value: searchQuery,
        fields: ['summary', 'fyp', 'status', 'remarks']
    });

    // role-based query filtering 
    switch (requestUser.role) {
        case userRole.SUPERVISOR:
            const projectIds = (await projectService.retrieveAll({ [supervisor._id]: requestUser.id })).map(project => project?._id);

            query = { $and: [{ $in: projectIds }, filter] }; break;

        case userRole.STUDENT:
            let studentQuery = buildMongoQuery({
                fields: ['lead', 'memberOne', 'memberTwo'],
                value: requestUser.id
            }, { isObjectId: true });

            studentQuery = { project: (await projectService.retrieveOne(studentQuery))?._id }
            query = { $and: [studentQuery, filter] }; break;

        default: query = filter;
    }

    // retrieve progress documents and pagination metadata
    return await tryCatch(async () => {
        // retrieve pagination metadata
        const metadata = await calculatePaginationMetadata(progress, {
            query, meta: { currentPage, documentCount }
        });

        // retrieve progress documents
        const progresses = await readDatabase(progress, {
            query, meta: { currentPage, documentCount, populate: 'progress' }
        });

        // return object containing document and pagination info
        return { progresses, metadata };
    });
};

// function to retrieve single specified progress document
const retrieveOne = async (query) => {
    // validate query
    validateParameter('object', query);

    // return retrieved progress document or null
    return await tryCatch(() => {
        return progress.findOne(query).populate(populateOptions.progress);
    });
};

// function to create a new progress document
const create = async (data) => {
    // validate query 
    validateParameter('object', data);

    // return newly created progress document
    return await tryCatch(async () => {
        return (await progress.create(data)).populate(populateOptions.progress);
    });
};

// function to update specified progress document
const update = async (query, data) => {
    // validate query and data
    validateParameter('object', query, data);

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
const del = async (_id) => {
    // validate id is a valid mongoose ID
    validateMongooseObjectId(_id);

    // delete and retrieve deleted progress document
    const deleted = await tryCatch(() => {
        return progress.findOneAndDelete(query).populate(populateOptions.progress);
    });

    // delete old proposal file when progress document deletion was successful
    if (deleted && deleted.resource) {
        file.delete(deleted.resource);
    }

    // return deleted progress document
    return deleted;
};

export default { retrieveAll, retrieveOne, create, update, delete: del };