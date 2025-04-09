const filterRequestBody = (body, allowedFields, { acceptNull = [] } = {}) => Object.fromEntries(
    Object.entries(body).filter(([field, value]) => {
        if (acceptNull.includes(field)) {
            return allowedFields.includes(field)
        };
        return value && allowedFields.includes(field);
    })
);

export default filterRequestBody;
