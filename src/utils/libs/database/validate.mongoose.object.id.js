import mongoose from "mongoose";
import toast from "../../constants/toast.js";

// function to validate mongoose ObjectId
const validateMongooseObjectId = (value) => {
    if (!mongoose.isValidObjectId(value)) {
        throw new Error(toast.VALIDATION.INVALID_ID('mongoose'));
    }
}

export default validateMongooseObjectId;