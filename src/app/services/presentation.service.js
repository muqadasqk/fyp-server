import tryCatch from '../../utils/libs/helper/try.catch.js';
import buildMongoQuery from '../../utils/libs/database/build.mongo.query.js';
import populateOptions from '../../utils/constants/populate.options.js';
import calculatePaginationMetadata from '../../utils/libs/database/calculate.pagination.metadata.js';
import readDatabase from '../../utils/libs/database/read.database.js';
import validateParameter from '../../utils/libs/helper/validate.parameter.js';
import validateMongooseObjectId from '../../utils/libs/database/validate.mongoose.object.id.js';
import presentation from '../models/presentation.js';
import file from '../middlewares/file.js';
import userRole from '../../utils/constants/user.role.js';
import projectService from './project.service.js';
import project from '../models/project.js';

// function to retrieve all presentation documents
const retrieveAll = async (options = {}, extra = {}) => {
    // destructure parameter arguments
    const { searchQuery, currentPage, documentCount } = options;
    const { requestUser, userQuery } = extra;

    // initialize query
    let query = {};

    // create query to filter query documents
    const filterQuery = buildMongoQuery({
        value: searchQuery,
        fields: ['summary', 'fyp', 'status', 'remarks']
    });

    // role-based filtering
    if (requestUser) {
        switch (requestUser.role) {
            case userRole.SUPERVISOR:
                const projectIds = (await project.find({ supervisor: requestUser.id })).map(project => project?._id);

                if (projectIds.length < 1) {
                    return await tryCatch(async () => ({
                        presentations: [],
                        metadata: await calculatePaginationMetadata(presentation, {
                            meta: { currentPage, documentCount, useDefault: true }
                        })
                    }));
                }
                query = { $and: [{ project: { $in: projectIds } }, filterQuery] }; break;

            case userRole.STUDENT:
                let studentQuery = buildMongoQuery({
                    fields: ['lead', 'memberOne', 'memberTwo'],
                    value: requestUser.id
                }, { isObjectId: true });

                studentQuery = { project: (await projectService.retrieveOne(studentQuery))?._id }
                query = { $and: [studentQuery, filterQuery] }; break;

            default: query = filterQuery;
        }
    }

    // query filtering
    if (userQuery) {
        query = { $and: [userQuery, filterQuery] };
    }

    // retrieve presentation documents and pagination metadata
    return await tryCatch(async () => {
        // retrieve pagination metadata
        const metadata = await calculatePaginationMetadata(presentation, {
            query, meta: { currentPage, documentCount }
        });

        // retrieve presentation documents
        const presentations = await readDatabase(presentation, {
            query, meta: { currentPage, documentCount, populate: 'presentation' }
        });

        // return object containing document and pagination info
        return { presentations, metadata };
    });
};

// function to retrieve single specified presentation document
const retrieveOne = async (query) => {
    // validate query
    validateParameter('object', query);

    // return retrieved presentation document or null
    return await tryCatch(() => {
        return presentation.findOne(query).populate(populateOptions.presentation);
    });
};

// function to create a new presentation document
const create = async (data) => {
    // validate query 
    validateParameter('object', data);

    // return newly created presentation document
    return await tryCatch(async () => {
        return (await presentation.create(data)).populate(populateOptions.presentation);
    });
};

// function to update specified presentation document
const update = async (query, data) => {
    // validate query and data
    validateParameter('object', query, data);

    // attempt to update and retrieve old document
    const updated = await tryCatch(() => {
        return presentation.findOneAndUpdate(query, data, { new: false }).populate(populateOptions.presentation);
    });

    // delete old resource file if there was a new image uploaded 
    if (updated && data.resource) {
        file.delete(updated.resource);
    }

    // return old document before update was made
    return updated;
};

// method to delete single specified presentation document
const del = async (_id) => {
    // validate id is a valid mongoose ID
    validateMongooseObjectId(_id);

    // delete and retrieve deleted presentation document
    const deleted = await tryCatch(() => {
        return presentation.findByIdAndDelete(_id).populate(populateOptions.presentation);
    });

    // delete old proposal file when presentation document deletion was successful
    if (deleted && deleted.resource) {
        file.delete(deleted.resource);
    }

    // return deleted presentation document
    return deleted;
};

export default { retrieveAll, retrieveOne, create, update, delete: del };