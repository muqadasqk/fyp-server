import mongoose from 'mongoose';
import rules from '../../utils/libs/validation/rules.js';
import { messages } from '../../utils/libs/validation/messages.js';

const meetingSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },

    link: {
        type: String,
        required: true,
        validate: {
            validator: v => rules.url(v),
            message: messages.url.replace(':field', 'link')
        },
    },
    schedule: {
        type: Date,
        required: true,
        validate: {
            validator: v => rules.date(v, { futureDate: true }),
            message: messages.date.replace(':field', 'schedule')
        },
    },
    summary: {
        type: String,
        required: true,
        validate: {
            validator: v => rules.word(v, { min: 5, max: 350 }),
            message: 'The summary must be between 5 and 350 words'
        },
    },
    reference: {
        type: String,
        validate: {
            validator: v => !v || rules.url(v),
            message: messages.url.replace(':field', 'reference')
        },
        default: null,
    },

    status: {
        type: String,
        enum: ['scheduled', 'completed'],
        default: 'scheduled',
    },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Meeting', meetingSchema);
