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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// function to check existence of a document based on field value query
export const existsInDatabase = async ({ field, value, model, except }) => await tryCatch(async () => {
    const query = { [field]: field === '_id' ? new mongoose.Types.ObjectId(value) : value };

    if (except) {
        const key = Object.keys(except)[0];
        query[key] = { $ne: except[key] }
    }

    return await database.connection.collection(model).countDocuments(query);
});

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

// validate password
export const password = {
    validate: async (password, hash) => {
        return await bcrypt.compare(password, hash);
    },

    hash: async (password) => {
        return await bcrypt.hash(password, await bcrypt.genSalt());
    },
};

// function to execute block of code in try-catch exception handling
export const tryCatch = async (fn, res = null) => {
    try {
        return await fn();
    } catch (error) {
        if (res === null) throw error;

        // return res.response(httpCode.SERVER_ERROR, toast.MISC.INTERNAL_ERROR, { error: error.message });
        return res.response(httpCode.SERVER_ERROR, error.message);
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
}

// object having method related to object
export const objFields = {
    // method to extract certain properties of an object only
    only: (obj, fields, options = { mongooseObject: false }) => {
        if (options.mongooseObject) {
            obj = obj.toObject();
        }

        return fields.reduce((acc, field) => {
            if (Object.prototype.hasOwnProperty.call(user, field)) {
                acc[field] = obj[field];
            }
            return acc;
        }, {});
    },

    // // method to extract certain properties of an object except
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
}

// function to generate and return an HTML template for email body content
export const generateEmailTempalate = (template, data) => {
    const templatePath = path.join(__dirname, '../views', `${template}.ejs`);
    return ejs.renderFile(templatePath, { data });
}