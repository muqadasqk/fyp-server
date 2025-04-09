import mongoose from "mongoose";

// function to validate mongoose ObjectId
const validateMongooseObjectId = (value) => {
    if (!mongoose.isValidObjectId(value)) {
        throw new Error(`The ${value} is invalid object ID`);
    }
}

export default validateMongooseObjectId;