import is from "./is.js";

// method to ensure certain type of an input value
const validateParameter = (type, ...params) => {
    if (!is[type]) {
        throw new Error(`Type ${type} is not defined in is.js`);
    }

    if (params.some((param) => !is[type](param))) {
        throw new Error(`Invalid ${type} parameter`);
    }
}

export default validateParameter;