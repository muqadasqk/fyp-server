// type-checking functions
const isArray = (data) => Array.isArray(data);
const isString = (data) => typeof data === 'string';
const isNumber = (data) => typeof data === 'number';
const isObject = (data) => typeof data === 'object';
const isNull = (data) => data === null;
const isUndefined = (data) => data === undefined;
const isBoolean = (data) => typeof data === 'boolean';
const isInstance = (instance, model) => instance instanceof model;

// function to ensure value is not null, empty, undefined, 0, or an empty array/object
const isEmpty = (data) => {
    if (isString(data)) return data.trim() === '';
    if (isNumber(data)) return data === 0;
    if (isArray(data)) return data.length === 0;
    if (isObject(data)) {
        if (Object.keys(data).length === 0) return true;
        for (const key in data) {
            if (isEmpty(data[key])) return true;
        }
    }
    return false;
};

export default {
    array: isArray,
    string: isString,
    number: isNumber,
    object: isObject,
    null: isNull,
    undefined: isUndefined,
    boolean: isBoolean,
    instance: isInstance,
    empty: isEmpty,
};
