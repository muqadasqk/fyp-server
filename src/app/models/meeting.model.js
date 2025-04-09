import mongoose from 'mongoose';

import rules from '../../utils/libs/validation/rules.js';
import { messages } from '../../utils/libs/validation/messages.js';

const MeetingSchema = new mongoose.Schema({
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

    // auto-delete meeting after 1 year
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        index: { expires: 0 },
        select: false,
    },
}, { timestamps: true, versionKey: false });

const Meeting = mongoose.model('Meeting', MeetingSchema);
export default Meeting;
