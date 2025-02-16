import mongoose from "mongoose";

// function to check existsence of mongoose collection model
const validateModelExistence = (name) => {
    const doesExist = Object.keys(mongoose.models).some((model) => {
        return model.toLowerCase() === name;
    });

    if (!doesExist) throw new Error(`Invalid ${model} model collection`);
}

export default validateModelExistence;