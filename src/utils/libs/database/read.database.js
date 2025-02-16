import populateOptions from "../../constants/populate.options.js";
import tryCatch from "../helper/try.catch.js";
import is from "../helper/is.js";

// Function to read database
const readDatabase = (model, { query, meta = {} }) => tryCatch(async () => {
    const { select, currentPage, documentCount, populate } = meta;

    let response = model.find(query);

    if (is.array(select) || is.string(select)) {
        response = response.select(select);
    }

    if (is.number(currentPage) && is.number(documentCount)) {
        response = response.skip((currentPage - 1) * documentCount);
    }

    if (is.number(documentCount)) {
        response = response.limit(documentCount);
    }

    if (populate && is.object(populateOptions[populate])) {
        response = response.populate(populateOptions[populate]);
    }

    return await response;
});

export default readDatabase;
