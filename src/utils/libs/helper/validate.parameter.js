// method to ensure certain type of an input value
const validateParameter = (type, ...params) => {
    if (params.some((param) => typeof param !== type)) {
        throw new Error(`Invalid ${type} parameter`);
    }
}

export default validateParameter;