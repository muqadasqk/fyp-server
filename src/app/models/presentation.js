import mongoose from 'mongoose';
import rules from '../../utils/libs/validation/rules.js';

const presentationSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },

    summary: {
        type: String,
        required: true,
        validate: {
            validator: v => rules.word(v, { min: 10, max: 350 }),
            message: 'The summary must be between 10 and 350 words'
        },
    },
    fyp: {
        type: String,
        enum: ['fyp1', 'fyp2', 'fyp3', 'fypFinal'],
        default: 'fyp1',
        required: true,
    },
    resource: {
        type: String,
        required: true,
    },

    remarks: {
        type: String,
        validate: {
            validator: v => !v || rules.word(v, { min: 5, max: 350 }),
            message: 'Remarks must be between 5 and 350 words'
        },
        default: null,
    },
    status: {
        type: String,
        enum: ['submitted', 'pendingReview', 'reviewed', 'rejected'],
        default: 'pending-review',
    },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Presentation', presentationSchema);