import mongoose from "mongoose";
import { existsInDatabase } from "../functions.js";

export default Object.freeze({
    required: (value) => !!value,
    string: (value) => /^[a-zA-Z\s]+$/.test(value),
    email: (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
    password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),

    number: (value) => /^[0-9]+$/.test(value),
    minDigit: (value, min) => /^[0-9]+$/.test(value) && value.length >= min,
    maxDigit: (value, max) => /^[0-9]+$/.test(value) && value.length <= max,

    size: (value, size) => typeof value === 'string' && value.length === size,
    min: (value, min) => typeof value === 'string' && value.length >= min,
    max: (value, max) => typeof value === 'string' && value.length <= max,

    filesize: ({ size }, maxSize) => /^[0-9]+(\.[0-9]+)?$/.test(size) && parseFloat(size) <= maxSize,
    extension: ({ extension }, options) => Object.values(options).includes(extension),

    same: (value, match) => value == Object.values(match)[0],
    in: (value, options) => Object.values(options).includes(value),

    mongooseId: (value) => mongoose.isValidObjectId(value),
    unique: async (value, options) => {
        if (!options.field) {
            throw new Error('Field is required for unique validation');
        }
        return !(await existsInDatabase({ value, ...options }));
    },
    exists: async (value, options) => {
        if (!options.field) {
            throw new Error('Field is required to check existence');
        }
        return !(await existsInDatabase({ value, ...options }));
    },
});