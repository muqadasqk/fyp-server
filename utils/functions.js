import sanitizeInput from "sanitize-html";
import path from 'path';
import ejs from 'ejs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import httpCode from "./constants/http.code.js";
import toast from "./constants/toast.js";
import { fileURLToPath } from 'url';
import database from "../config/database.js";
import mongoose from "mongoose";
import env from "../config/env.js";
import populateOptions from "./constants/populate.options.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// function to check existence of a document based on field value query
export const existsInDatabase = async (value, options) => await tryCatch(async () => {
    const model = Object.keys(options)[0]

    if (!modelExists(model)) {
        throw new Error(`Invalid ${model} model collection`);
    }

    let query = buildQuery(options[model], value);
    if (options.except) {
        const key = Object.keys(options.except)[0];
        query = buildQuery(key, options.except[key], { operator: '$ne', query });
    }

    return await database.connection.collection(model + 's').countDocuments(query);
});

// function to check existsence of mongo collection model
export const modelExists = modelName => Object.keys(mongoose.models).map(str.lower).some(model => {
    return str.compare(model, modelName, { strict: true });
});

// function to form a query
export const buildQuery = (field, value, options = { operator: '', query: {} }) => {
    if (options.operator && options.query) {
        if (field !== '_id') {
            return { ...options.query, [field]: { [options.operator]: value } };
        }

        validateMongoObjectID(value);
        return { ...options.query, [field]: { [options.operator]: objectId(value) } };
    }

    else if (field !== '_id') {
        return { [field]: value };
    }

    validateMongoObjectID(value);
    return { [field]: objectId(value) };
}

// function to get pagination info
export const paginationInfo = async (model, filter, { page, limit }) => tryCatch(async () => {
    // retrieve total project documents count
    const totalCount = await model.countDocuments(filter);

    // calculate total pages based on limit
    const totalPages = Math.ceil(totalCount / limit);

    // return object containing total and current page info
    return { current: page, total: totalPages, limit };
});

// function to retrieve documents
export const retrieveDocuments = async (model, filter, { page, limit, select = null, populate = null }) => tryCatch(async () => {
    // retrieve document with optionally according to filter, page and limit with populate options
    return await model.find(filter)
        .select(select && select)
        .skip((page - 1) * limit).limit(limit)
        .populate(populate && populateOptions[populate])
});

// function to create search query
export const createFilter = (query, filterFields, options = { mongooseId: false }) => {
    // return empty object whether query or filterFields are empty
    if (!query || filterFields.length === 0) {
        return {};
    }

    // throw error if query is not a string
    if (!is.string(query)) {
        throw new Error('Query must be a string');
    }

    // throw error if filterFields parameter is not an array
    if (!is.array(filterFields)) {
        throw new Error('Filter fields must be an array');
    }

    // iterator over filterFields to create mongoDB filter query
    const searchableFields = filterFields.map((field) => {
        if (options.mongooseId) return { [field]: objectId(query) };
        else return { [field]: { $regex: query, $options: 'i' } }
    });

    // return searchable query object
    return { $or: searchableFields };
};

// function to create mongoose ObjectId
export const objectId = id => {
    return new mongoose.Types.ObjectId(id);
}

// function to validate mongoDB ObjectId
export const validateMongoObjectID = (id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new Error(toast.VALIDATION.INVALID_ID('mongoose'));
    }
}

// function to verify token
export const verifyJWT = token => tryCatch(() => {
    if (!token) throw new Error(toast.MISC.ACCESS_DENIED);

    return jwt.verify(token.replace('Bearer ', ''), env.secret.key);
});

// password object containg methods related with password
export const password = {
    // method to compare password with hash
    compare: async (password, hash) => {
        return await bcrypt.compare(password, hash);
    },

    // method to make hash of string
    hash: async (password) => {
        return await bcrypt.hash(password, await bcrypt.genSalt());
    },

    // method to generate a rondom password; optionally shuffled string
    generate: () => {
        const alphaChars = 'abcdefghijklmnopqrstuvwxyz';
        const upperAlphaChars = str.upper(alphaChars);
        const numChars = '1234567890';
        const specialChars = '@#$&';

        return [
            getRandomChar(alphaChars),
            getRandomChar(upperAlphaChars),
            getRandomChar(numChars),
            getRandomChar(specialChars),
            ...Array(4).fill(0).map(() => getRandomChar(alphaChars + upperAlphaChars + numChars + specialChars)),
        ].join('');
    }
};

// function to get a random character from a string
function getRandomChar(charSet) {
    return charSet.charAt(Math.floor(Math.random() * charSet.length));
};

// function to execute block of code in try-catch exception handling
export const tryCatch = async (fn, res = null) => {
    try {
        return await fn();
    } catch (error) {
        if (res === null) throw error;

        // return res.response(httpCode.SERVER_ERROR, toast.MISC.INTERNAL_ERROR, { error: error.message });
        return res.response(httpCode.SERVER_ERROR, error.message, { stack: error.stack });
    }
};

// object having methods related to input field
export const input = {
    // method to ensure certain type of an input value
    validate: (param, type) => {
        if (!is[type](param)) {
            throw new Error(`invalid ${type} parameter`);
        }
    },

    // method to sanitize input value
    sanitize: input => sanitizeInput(input),
}

// object having methods related to type checking and value existence
export const is = {
    // methods to check certain type against passed parameter
    array: (data) => Array.isArray(data),
    string: (data) => typeof data === 'string',
    number: (data) => typeof data === 'number',
    object: (data) => typeof data === 'object',
    null: (data) => data === null,
    undefined: (data) => data === undefined,
    boolean: (data) => typeof data === 'boolean',

    // method to enure value is not null|empty|undefined|0 or an empty array|object
    empty: (data) => {
        if (is.string(data)) return data.trim() === '';
        else if (is.number(data)) return data === 0;
        else if (is.array(data)) return data.length === 0;
        else if (is.object(data)) {
            if (Object.keys(data).length === 0) return true;
            for (const key in data) {
                if (is.empty(data[key])) return true;
            }
        }
        return false;
    },
}

// object having methods related to string
export const str = {
    // method to change parameter(s) to string type
    toString: (...args) => args.map(String),

    // method to capitalize the string
    cap: string => {
        if (!is.string(string)) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    // method to capitalize each word in the string
    capEach: string => {
        if (!is.string(string)) return string;
        return string.split(' ').map(str.cap).join(' ');
    },

    // method to capitalize the string
    upper: string => {
        if (!is.string(string)) return string;
        return string.toUpperCase();
    },

    // method to capitalize the string
    lower: string => {
        if (!is.string(string)) return string;
        return string.toLowerCase();
    },

    // method to create slug of string
    slug: string => {
        if (!is.string(string)) return string;
        return string.replaceAll(/\s/g, '-');
    },

    // method to separate camelacase word string into separate words
    splitCamelCase: string => {
        if (!is.string(string)) return string;
        return string.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
    },

    // method to generate an OTP of specified lenght
    generateOTP: length => Math.floor(Math.random() * (10 ** length)),

    // method to compare two strings; optionally strich comparison
    compare: (source, target, options = { strict: false }) => {
        const [x, y] = str.toString(source, target);

        if (options.strict) return x === y;
        return x.toLowerCase() === y.toLowerCase();
    },

    // method to shuffle the string
    shuffle: (string = '') => string.split('').reduce((acc, char) => {
        acc.splice(Math.floor(Math.random() * (acc.length + 1)), 0, char);
        return acc;
    }, []).join(''),
}

// object having method related to object
export const objFields = {
    // method to extract certain properties of an object only
    only: (obj, fields, options = { mongooseObject: false }) => {
        if (options.mongooseObject) {
            obj = obj.toObject();
        }

        return fields.reduce((acc, field) => {
            if (Object.prototype.hasOwnProperty.call(obj, field)) {
                acc[field] = obj[field];
            }
            return acc;
        }, {});
    },

    // method to extract certain properties of an object except
    except: (obj, fields, options = { mongooseObject: false }) => {
        if (options.mongooseObject) {
            obj = obj.toObject();
        }

        return Object.keys(obj).reduce((acc, field) => {
            if (!fields.includes(field)) {
                acc[field] = obj[field];
            }
            return acc;
        }, {});
    },

    // method to check whether field(s) is/are available or not
    available: (obj, field, options = { null: false }) => {
        if (!options.null) return Object.hasOwn(obj, field);
        return Object.hasOwn(obj, field) && !obj[field];
    }
}

// function to generate and return an HTML template for email body content
export const generateEmailTempalate = (template, data) => {
    const templatePath = path.join(__dirname, '../views', `${template}.ejs`);
    return ejs.renderFile(templatePath, { data });
}