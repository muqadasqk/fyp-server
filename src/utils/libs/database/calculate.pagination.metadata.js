import env from "../../../config/env.js";
import tryCatch from "../helper/try.catch.js";

// function to calculate pagination metadata
const calculatePaginationMetadata = (model, { query, meta = {} }) => tryCatch(async () => {
    const { currentPage, documentCount, useDefault } = meta;

    if (useDefault) return {
        currentPage: currentPage > 0 ? currentPage : 1,
        totalPages: 0,
        recordsPerPage: documentCount > 0 ? documentCount : parseInt(env.document.count),
        totalRecordCount: 0,
        currentRecordCount: 0,
    }

    const totalDocumentsCount = await model.countDocuments(query);

    const totalPagesCount = documentCount > 0 ? Math.ceil(totalDocumentsCount / documentCount) : 1;
    const recordsToSkip = (currentPage > 0 ? (currentPage - 1) * documentCount : 0);

    const currentDocumentsCount = await model.countDocuments(query)
        .skip(recordsToSkip)
        .limit(documentCount > 0 ? documentCount : totalDocumentsCount);
    return {
        currentPage: currentPage > 0 ? currentPage : 1,
        totalPages: totalPagesCount,
        recordsPerPage: documentCount > 0 ? documentCount : parseInt(env.document.count),
        totalRecordCount: totalDocumentsCount,
        currentRecordCount: currentDocumentsCount,
    };
});

export default calculatePaginationMetadata;
