import is from "../helper/is.js";
import createMongooseObjectId from "./create.mongoose.object.id.js";

// function to build mongo query
const buildMongoQuery = ({ field = null, fields = null, value }, options = {}) => {
    const { isObjectId, operator, regex = true } = options;

    if (!value) {
        return {};
    }

    const buildQueryForField = (field) => {
        if (isObjectId || field.equals('_id')) {
            return { [field]: createMongooseObjectId(String(value)) };
        }

        if (!regex) {
            return { [field]: value };
        }

        return { [field]: { $regex: value, $options: 'i' } };
    };

    if (field) {
        return buildQueryForField(field);
    }

    if (is.array(fields) && fields.length > 0) {
        const filterArray = fields.map(buildQueryForField);
        return { [operator ?? '$or']: filterArray };
    }

    throw new Error("Either 'field' or 'fields' must be provided");
}

export default buildMongoQuery;