const constructQuery = (query = {}, optionalSearch = false) => {
    if (!query || typeof query !== "object" || Array.isArray(query)) {
        throw new Error("Invalid query: Expected an object.");
    }

    const constructedQuery = Object.fromEntries(
        Object.entries(query).map(([key, value]) => [
            key,
            typeof value === "string" ? { $regex: value.trim(), $options: "i" } : value
        ])
    );

    return optionalSearch
        ? { $or: Object.keys(constructedQuery).map((key) => ({ [key]: constructedQuery[key] })) }
        : constructedQuery;
};

export default constructQuery;
