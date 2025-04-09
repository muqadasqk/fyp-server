import mongoose from 'mongoose';

import rules from '../../utils/libs/validation/rules.js';
import file from '../middlewares/file.js';

const PresentationSchema = new mongoose.Schema({
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
        default: 'pendingReview',
    },

    // auto-delete presentation after 1 year
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        select: false,
    },
}, { timestamps: true, versionKey: false });

// extra methods
PresentationSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update.resource) {
        const doc = await this.model.findOne(this.getFilter());
        if (doc && doc.resource) file.delete(doc.resource)
    }
    next();
});

PresentationSchema.pre('findOneAndDelete', async function (next) {
    const presentation = await this.model.findOne(this.getQuery());
    if (presentation && presentation.resource) file.delete(presentation.resource);
    next();
});

const Presentation = mongoose.model('Presentation', PresentationSchema);
export default Presentation;