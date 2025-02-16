import database from "../../../config/database.js";
import tryCatch from "../helper/try.catch.js";
import buildMongoQuery from "./build.mongo.query.js";
import createMongooseObjectId from "./create.mongoose.object.id.js";
import validateModelExistence from "./validate.model.existence.js";

// function to check existence of a document in the database
const documentExists = ({ model, field, value, skip = null }) => tryCatch(async () => {
    validateModelExistence(model);

    let query = buildMongoQuery({ field, value }, { regex: false });
    if (skip) {
        const [key, val] = skip.entryAt(0);
        query = { ...query, [key]: { '$ne': key.equals('_id') ? createMongooseObjectId(val) : val } }
    }

    return await database.connection.collection(model.concat('s')).countDocuments(query);
});


export default documentExists;