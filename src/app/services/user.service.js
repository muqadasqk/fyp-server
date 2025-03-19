
import tryCatch from '../../utils/libs/helper/try.catch.js';
import buildMongoQuery from '../../utils/libs/database/build.mongo.query.js';
import calculatePaginationMetadata from '../../utils/libs/database/calculate.pagination.metadata.js';
import user from '../models/user.js';
import readDatabase from '../../utils/libs/database/read.database.js';
import validateParameter from '../../utils/libs/helper/validate.parameter.js';
import file from '../middlewares/file.js';
import validateMongooseObjectId from '../../utils/libs/database/validate.mongoose.object.id.js';

// function to retrieve all user documents
const retrieveAll = async (options = {}) => {
    // destructure options
    const { searchQuery, currentPage, documentCount } = options;

    // create query to filter documents
    const query = buildMongoQuery({
        value: searchQuery,
        fields: ['name', 'email', 'nic', 'rollNo']
    });

    // retrieve user documents and pagination metadata
    return await tryCatch(async () => {
        // retrieve pagination metadata
        const metadata = await calculatePaginationMetadata(user, {
            query, meta: { currentPage, documentCount }
        });

        // retrieve user documents
        const users = await readDatabase(user, {
            query, meta: { currentPage, documentCount, select: '-password' }
        });

        // return object containing document and pagination info
        return { users, metadata };
    });
};

// function to retrieve single specified user document
const retrieveOne = async (query) => {
    // validate query
    validateParameter('object', query);

    // return retrieved user document or null
    return await tryCatch(() => user.findOne(query));
};

// method to create a new user document
const create = async (data) => {
    // validate data
    validateParameter('object', data);

    // return newly created user document
    return await tryCatch(() => user.create(data));
}

// method to update single specified user document 
const update = async (query, data) => {
    // validate data
    validateParameter('object', query, data);

    // attempt to update and retrieve old document
    const updated = await tryCatch(() => user.findOneAndUpdate(query, data, { new: false }));

    // delete old image file if there was a new image uploaded
    if (updated && data.image && updated.image !== 'default.jpg') {
        file.delete(updated.image);
    }

    // return old document before update was made
    return updated;
};

// method to delete single specified user document
const del = async (id) => {
    // validate mongoose ID
    validateMongooseObjectId(id)

    // delete and retrieve deleted user document
    const deleted = await tryCatch(async () => await user.findByIdAndDelete(id));

    // delete old image file when user document deletion was successful
    if (deleted && deleted.image && deleted.image !== 'default.jpg') {
        file.delete(deleted.image);
    }

    // return deleted user document
    return deleted;
};

export default { retrieveAll, retrieveOne, create, update, delete: del };