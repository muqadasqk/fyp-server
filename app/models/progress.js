import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    session: {
        type: String,
        enum: ['firstSession', 'secondSession', 'thirdSession', 'final'],
        required: true,
    },
    submissionDate: {
        type: Date,
        required: true,
    },
    submissionFile: {
        type: String,
        required: true,
    },
    remarks: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['submitted', 'pending-review', 'reviewed', 'rejected'],
        default: 'pending-review',
    },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Progress', progressSchema);