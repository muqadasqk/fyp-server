import tryCatch from '../../utils/libs/helper/try.catch.js';
import buildMongoQuery from '../../utils/libs/database/build.mongo.query.js';
import populateOptions from '../../utils/constants/populate.options.js';
import calculatePaginationMetadata from '../../utils/libs/database/calculate.pagination.metadata.js';
import readDatabase from '../../utils/libs/database/read.database.js';
import validateParameter from '../../utils/libs/helper/validate.parameter.js';
import validateMongooseObjectId from '../../utils/libs/database/validate.mongoose.object.id.js';
import project from '../models/project.js';
import file from '../../middlewares/file.js';
import userRole from '../../utils/constants/user.role.js';


// function to retrieve all project documents
const retrieveAll = async (requestUser, options = {}) => {
    // destructure options
    const { searchQuery, currentPage, documentCount } = options;

    // initialize query
    let query = {};

    // create query to filter documents
    const filter = buildMongoQuery({
        value: searchQuery,
        fields: ['title', 'abstract', 'status']
    });

    // role-based query filtering 
    // switch (requestUser.role) {
    //     case userRole.SUPERVISOR:
    //         query = { $and: [{ supervisor: requestUser.id }, filter] };
    //         break;

    //     case userRole.STUDENT:
    //         const studentQuery = buildMongoQuery({
    //             fields: ['lead', 'memberOne', 'memberTwo'],
    //             value: requestUser.id
    //         }, { isObjectId: true });
    //         query = { $and: [studentQuery, filter] };
    //         break;

    //     default:
    //         query = filter;
    // }
    query = filter;


    // retrieve user documents and pagination metadata
    return await tryCatch(async () => {
        // retrieve pagination metadata
        const metadata = await calculatePaginationMetadata(project, {
            query, meta: { currentPage, documentCount }
        });

        // retrieve user documents
        const projects = await readDatabase(project, {
            query, meta: { currentPage, documentCount, populate: 'project' }
        });

        // return object containing document and pagination info
        return { projects, metadata };
    });
};

// function to retrieve single specified project document
const retrieveOne = async (query) => {
    // validate query
    validateParameter('object', query);

    // return retrieved project document or null
    return await tryCatch(() => {
        return project.findOne(query).populate(populateOptions.project);
    });
};

// function to create a new project document
const create = async (data) => {
    // validate query 
    validateParameter('object', data);

    // return newly created project document
    return await tryCatch(async () => {
        return (await project.create(data)).populate(populateOptions.project);
    });
};

// function to update specified project document
const update = async (query, data) => {
    // validate query and data
    validateParameter('object', query, data);

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
const del = async (id) => {
    // validate id is a valid mongoose ID
    validateMongooseObjectId(id);

    // delete and retrieve deleted project document
    const deleted = await tryCatch(() => {
        return project.findByIdAndDelete(id).populate(populateOptions.project);
    });

    // delete old proposal file when project document deletion was successful
    if (deleted && deleted.proposal) {
        file.delete(deleted.proposal);
    }

    // return deleted project document
    return deleted;
};

export default { retrieveAll, retrieveOne, create, update, delete: del };