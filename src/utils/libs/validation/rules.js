import mongoose from "mongoose";
import documentExists from "../database/document.exists.js";

export default Object.freeze({
    required: (value) => !!value,
    string: (value) => /^[a-zA-Z\s]+$/.test(value),
    email: (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
    phone: (value) => /^(3[0-3,7]\d{8})$/.test(value),
    password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),
    regex: (value, pattern) => pattern.test(value),

    rollNo: (value) => /^[0-9]{2}[a-zA-Z]{2}[0-9]{3}$/.test(value),
    cnic: (value) => /^\d{13}$/.test(value),
    pid: (value) => /^[A-Z]{2}-\d{3}$/.test(value),
    url: (value) => /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/.test(value),
    date: (value, { futureDate = false }) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) && (futureDate && date > new Date());
    },

    number: (value) => /^\d+$/.test(value),
    minDigit: (value, min) => /^\d+$/.test(value) && String(value).length >= min,
    maxDigit: (value, max) => /^\d+$/.test(value) && String(value).length <= max,
    digits: (value, maxDigits) => /^\d+$/.test(value) && String(value).length == maxDigits,

    size: (value, size) => String(value).length == size,
    min: (value, min) => String(value).length >= min,
    max: (value, max) => String(value).length <= max,
    word: (value, options) => {
        const wordCount = value.trim().split(/\s+/).length;
        return (!options.min || wordCount >= options.min) && (!options.max || wordCount <= options.max);
    },

    filesize: ({ size }, maxSize) => /^\d+(\.\d+)?$/.test(size) && parseFloat(size) <= maxSize,
    extension: ({ extension }, options) => Object.values(options).includes(extension),

    same: (value, match) => value == Object.values(match)[0],
    match: (value, match) => value == match,
    in: (value, options) => Object.values(options).includes(value),
    exclude: (value, options) => !(options = options.filter(Boolean)).length || !options.includes(value),

    mongooseId: (value) => mongoose.isValidObjectId(value),
    unique: async (value, options) => {
        const [model, field] = options.entryAt(0);
        return !await documentExists({ model, field, value, skip: options.skip });
    },
    exists: async (value, options) => {
        const [model, field] = options.entryAt(0);
        return !!await documentExists({ model, field, value, skip: options.skip });
    },
});