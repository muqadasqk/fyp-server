import mongoose from 'mongoose';
import rules from '../../utils/libs/validation/rules.js';

const meetingSchema = new mongoose.Schema({
    progress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Progress',
        required: true,
    },

    link: {
        type: String,
        default: null,
    },

    summary: {
        type: String,
        validate: { validator: v => null || rules.word(v, { min: 5, max: 350 }) },
        default: null
    },

    status: {
        type: String,
        enum: ['scheduled', 'completed'],
        default: 'scheduled',
    },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Meeting', meetingSchema);