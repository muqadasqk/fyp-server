import mongoose from 'mongoose';
import rules from '../../utils/validation/rules.js';

const progressSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },

    summary: {
        type: String,
        required: true,
        validate: { validator: v => rules.word(v, { min: 10, max: 350 }) }
    },
    session: {
        type: String,
        enum: ['session1', 'session2', 'session3', 'sessionFinal'],
        required: true,
    },
    resource: {
        type: String,
        required: true,
    },

    remarks: {
        type: String,
        validate: { validator: v => v === null || rules.word(v, { min: 5, max: 350 }) },
        default: null,
    },
    status: {
        type: String,
        enum: ['submitted', 'pending-review', 'reviewed', 'rejected'],
        default: 'pending-review',
    },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Progress', progressSchema);