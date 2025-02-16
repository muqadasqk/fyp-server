import tryCatch from "../helper/try.catch.js";

// function to calculate pagination metadata
const calculatePaginationMetadata = (model, { query, meta = {} }) => tryCatch(async () => {
    const { currentPage, documentCount } = meta;

    const totalDocumentsCount = await model.countDocuments(query);

    const totalPagesCount = Math.ceil(totalDocumentsCount / documentCount);
    const recordsToSkip = (currentPage - 1) * documentCount;

    const currentDocumentsCount = await model.countDocuments(query)
        .skip(recordsToSkip)
        .limit(documentCount);

    return {
        currentPage,
        totalPages: totalPagesCount,
        recordsPerPage: documentCount,
        totalRecordCount: totalDocumentsCount,
        currentRecordCount: currentDocumentsCount,
    };
});

export default calculatePaginationMetadata;
