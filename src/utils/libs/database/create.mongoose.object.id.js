import mongoose from "mongoose";

import validateMongooseObjectId from "./validate.mongoose.object.id.js";

// function to create a mongoose ObjectId
const createMongooseObjectId = (value) => {
    validateMongooseObjectId(value);
    return new mongoose.Types.ObjectId(String(value));
};

export default createMongooseObjectId;
