import tryCatch from '../../utils/libs/helper/try.catch.js';
import User from '../models/user.model.js';
import validateParameter from '../../utils/libs/helper/validate.parameter.js';
import validateMongooseObjectId from '../../utils/libs/database/validate.mongoose.object.id.js';
import constructQuery from '../../utils/libs/database/construct.query.js';
import pagination from '../../utils/libs/database/pagination.js';

// function to retrieve all user documents
const retrieveAll = async ({ query = {}, current = 1, size = 10, sort = {} } = {}) => tryCatch(async () => {
    // constuct the query to search on fields
    const searchQuery = constructQuery(query, true);

    // merge query to omit admin account(s)
    const omitAdmin = { $and: [{ role: { $ne: "admin" } }, searchQuery] };

    // retrieve documents with pagination
    return await pagination(User, { query: omitAdmin, current, size, sort });
});

// function to retrieve single specified user document
const retrieveOne = async (query, { withPassword = false } = {}) => {
    // validate query
    validateParameter('object', query);

    // return retrieved user document or null
    return await tryCatch(() => User.findOne(query).select(withPassword && "+password"));
};

// method to create a new user document
const create = async (data) => {
    // validate data
    validateParameter('object', data);

    // return newly created user document
    return await tryCatch(() => User.create(data));
}

// method to update single specified user document 
const update = async (query, data) => {
    // validate data
    validateParameter('object', query, data);

    // attempt to update and return new updated document
    return await tryCatch(() => User.findOneAndUpdate(query, data, { new: true }));
};

// method to delete single specified user document
const del = async (id) => {
    // validate mongoose ID
    validateMongooseObjectId(id)

    // delete and return deleted user document
    return await tryCatch(() => User.findByIdAndDelete(id));
};

export default { retrieveAll, retrieveOne, create, update, delete: del };