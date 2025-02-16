import mongoose from "mongoose";
import validateMongooseObjectId from "./validate.mongoose.object.id.js";

// function to create mongoose ObjectId
const createMongooseObjectId = (value) => {
    validateMongooseObjectId(value);
    return new mongoose.Types.ObjectId(value);
}

export default createMongooseObjectId;