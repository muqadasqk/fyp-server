import tryCatch from '../../utils/libs/helper/try.catch.js';
import buildMongoQuery from '../../utils/libs/database/build.mongo.query.js';
import populateOptions from '../../utils/constants/populate.options.js';
import calculatePaginationMetadata from '../../utils/libs/database/calculate.pagination.metadata.js';
import readDatabase from '../../utils/libs/database/read.database.js';
import validateParameter from '../../utils/libs/helper/validate.parameter.js';
import validateMongooseObjectId from '../../utils/libs/database/validate.mongoose.object.id.js';
import proposal from '../models/proposal.js';
import file from '../../middlewares/file.js';

// function to retrieve all proposal documents
const retrieveAll = async (options = {}, userQuery = null,) => {
    // destructure options
    const { searchQuery, currentPage, documentCount } = options;

    // create filter query
    const filterQuery = buildMongoQuery({
        value: searchQuery,
        fields: ['title', 'abstract', 'type', 'category', 'status']
    });

    // merge queries to filterQuery documents
    const query = userQuery ? { $and: [userQuery, filterQuery] } : filterQuery;

    // retrieve user documents and pagination metadata
    return await tryCatch(async () => {
        // retrieve pagination metadata
        const metadata = await calculatePaginationMetadata(proposal, {
            query, meta: { currentPage, documentCount }
        });

        // retrieve user documents
        const proposals = await readDatabase(proposal, {
            query, meta: { currentPage, documentCount, populate: 'proposal' }
        });

        // return object containing document and pagination info
        return { proposals, metadata };
    });
};

// function to retrieve single specified proposal document
const retrieveOne = async (query) => {
    // validate query
    validateParameter('object', query);

    // return retrieved proposal document or null
    return await tryCatch(() => {
        return proposal.findOne(query).populate(populateOptions.proposal);
    });
};

// function to create a new proposal document
const create = async (data) => {
    // validate query 
    validateParameter('object', data);

    // return newly created proposal document
    return await tryCatch(async () => {
        return (await proposal.create(data)).populate(populateOptions.proposal);
    });
};

// function to update specified proposal document
const update = async (query, data) => {
    // validate query and data
    validateParameter('object', query, data);

    // attempt to update and retrieve old document
    return await tryCatch(() => {
        return proposal.findOneAndUpdate(query, data, { new: false }).populate(populateOptions.proposal);
    });
};

// method to delete single specified proposal document
const del = async (id) => {
    // validate id is a valid mongoose ID
    validateMongooseObjectId(id);

    // delete and retrieve deleted proposal document
    return await tryCatch(() => {
        return proposal.findByIdAndDelete(id).populate(populateOptions.proposal);
    });
};

export default { retrieveAll, retrieveOne, create, update, delete: del };