import mongoose from 'mongoose';

import rules from '../../utils/libs/validation/rules.js';
import { messages } from '../../utils/libs/validation/messages.js';
import file from '../middlewares/file.js';

const ProjectSchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    memberOne: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    memberTwo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    pid: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: v => rules.pid(v),
            message: messages.pid
        }
    },
    title: {
        type: String,
        unique: true,
        minlength: 3,
        maxlength: 255,
        required: true,
    },
    abstract: {
        type: String,
        validate: {
            validator: v => rules.word(v, { min: 200, max: 350 }),
            message: 'The abstract must be between 200 and 350 words'
        },
    },
    proposal: {
        type: String,
        default: null,
    },

    type: {
        type: String,
        enum: ['new', 'modifiedOrExtension', 'researchBased'],
        default: 'new'
    },
    category: {
        type: String,
        required: true,
        validate: {
            validator: v => rules.string(v),
            message: 'The category must be letters/string only'
        },
    },
    status: {
        type: String,
        enum: ['completed', 'underDevelopement'],
        default: 'underDevelopement'
    },

    // auto-delete project after 1 year
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        select: false,
    },
}, { timestamps: true, versionKey: false });

// extra methods
ProjectSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update.proposal) {
        const doc = await this.model.findOne(this.getFilter());
        if (doc && doc.proposal) file.delete(doc.proposal)
    }
    next();
});

ProjectSchema.pre('findOneAndDelete', async function (next) {
    const project = await this.model.findOne(this.getQuery());
    if (project && project.proposal) file.delete(project.proposal);
    next();
});

const Project = mongoose.model('Project', ProjectSchema);
export default Project;