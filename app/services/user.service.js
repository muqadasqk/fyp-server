import { input, tryCatch, validateMongoObjectID } from '../../utils/functions.js';
import user from '../models/user.js';
import file from '../../middlewares/file.js';

// function to retrieve all user documents
const all = async (query = null) => {
    // initialized empty filter
    const filter = {};

    // if there is query; set filter query accordingly to match with any of the following fields
    if (query) {
        filter['$or'] = [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { nic: { $regex: query, $options: 'i' } },
            { rollNo: { $regex: query, $options: 'i' } },
        ];
    }

    // return retrieved user documents or empty array
    return await tryCatch(() => user.find(filter).select('-password'));
};

// function to retrieve single specified user document
const one = async query => {
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
    if (updated && updated.image !== 'default.jpg' && data.image) {
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
    if (deleted && update.image !== 'default.jpg' && deleted.image) {
        file.delete(deleted.image)
    }

    // return deleted user document
    return deleted;
};

export default { all, one, create, update, delete: del };