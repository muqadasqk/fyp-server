import { createFilter, getPaginationMetadata, input, retrieveDocuments, tryCatch, validateMongoObjectID } from '../../utils/functions.js';
import user from '../models/user.js';
import file from '../../middlewares/file.js';

// function to retrieve all user documents
const retrieveAll = async ({ query, page, limit }) => {
    // create filter to match fields with query string
    const filter = createFilter(query, ['name', 'email', 'nic', 'rollNo']);

    // retrieve project documents an pagination info and return an object
    return await tryCatch(async () => {
        // obtain pagination info
        const pagination = await getPaginationMetadata(user, filter, { page, limit });

        // retrieve project documents according to query, page and limit
        const users = await retrieveDocuments(user, filter, { page, limit, select: '-password' });

        // return object containing document and pagination info
        return { users, metadata: pagination };
    });
};

// function to retrieve single specified user document
const retrieveOne = async query => {
    // validate query is proper object
    input.validate(query, 'object');

    // return retrieved user document or null
    return await tryCatch(() => user.findOne(query));
};

// method to create a new user document
const create = async data => {
    // validate query is proper object
    input.validate(data, 'object');

    // return newly created user document
    return await tryCatch(() => user.create(data));
}

// method to update single specified user document 
const update = async (query, data) => {
    // validate query and data are proper object
    input.validate(data, 'object');
    input.validate(query, 'object');

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
const del = async id => {
    // validate id is a valid mongoose ID
    validateMongoObjectID(id);

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