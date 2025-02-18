import tryCatch from '../../utils/libs/helper/try.catch.js';
import buildMongoQuery from '../../utils/libs/database/build.mongo.query.js';
import populateOptions from '../../utils/constants/populate.options.js';
import calculatePaginationMetadata from '../../utils/libs/database/calculate.pagination.metadata.js';
import readDatabase from '../../utils/libs/database/read.database.js';
import validateParameter from '../../utils/libs/helper/validate.parameter.js';
import validateMongooseObjectId from '../../utils/libs/database/validate.mongoose.object.id.js';
import meeting from '../models/meeting.js';
import userRole from '../../utils/constants/user.role.js';
import projectService from './meeting.service.js';
import project from '../models/project.js';

// function to retrieve all meeting documents
const retrieveAll = async (options = {}, extra = {}) => {
    // destructure parameter arguments
    const { searchQuery, currentPage, documentCount } = options;
    const { requestUser, userQuery } = extra;

    // initialize query
    let query = {};

    // create filter
    const filterQuery = buildMongoQuery({
        value: searchQuery,
        fields: ['summary', 'reference', 'status']
    });

    // role-based query filtering 
    if (requestUser) {
        switch (requestUser.role) {
            case userRole.SUPERVISOR:
                const projectIds = (await project.find({ supervisor: requestUser.id })).map(project => project?._id);

                if (projectIds.length < 1) {
                    return await tryCatch(async () => ({
                        meetings: [],
                        metadata: await calculatePaginationMetadata(meeting, {
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

                studentQuery = { meeting: (await projectService.retrieveOne(studentQuery))?._id }
                query = { $and: [studentQuery, filterQuery] }; break;

            default: query = filterQuery;
        }
    }

    // query filtering
    if (userQuery) {
        query = { $and: [userQuery, filterQuery] };
    }

    // retrieve meeting documents and pagination metadata
    return await tryCatch(async () => {
        // retrieve pagination metadata
        const metadata = await calculatePaginationMetadata(meeting, {
            query, meta: { currentPage, documentCount }
        });

        // retrieve meeting documents
        const meetings = await readDatabase(meeting, {
            query, meta: { currentPage, documentCount, populate: 'meeting' }
        });

        // return object containing document and pagination info
        return { meetings, metadata };
    });
};

// function to retrieve single specified meeting document
const retrieveOne = async (query) => {
    // validate query
    validateParameter('object', query);

    // return retrieved meeting document or null
    return await tryCatch(() => {
        return meeting.findOne(query).populate(populateOptions.meeting);
    });
};

// function to create a new meeting document
const create = async (data) => {
    // validate query 
    validateParameter('object', data);

    // return newly created meeting document
    return await tryCatch(async () => {
        return (await meeting.create(data)).populate(populateOptions.meeting);
    });
};

// function to update specified meeting document
const update = async (query, data) => {
    // validate query and data
    validateParameter('object', query, data);

    // attempt to update and return old document
    return await tryCatch(() => {
        return meeting.findOneAndUpdate(query, data, { new: false }).populate(populateOptions.meeting);
    });
};

// method to delete single specified meeting document
const del = async (_id) => {
    // validate id is a valid mongoose ID
    validateMongooseObjectId(_id);

    // delete and return deleted meeting document
    return await tryCatch(() => {
        return meeting.findByIdAndDelete(_id).populate(populateOptions.meeting);
    });
};

export default { retrieveAll, retrieveOne, create, update, delete: del };