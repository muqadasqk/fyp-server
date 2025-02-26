import mongoose from 'mongoose';
import rules from '../../utils/libs/validation/rules.js';
import { messages } from '../../utils/libs/validation/messages.js';

const projectSchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    memberOne: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    memberTwo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
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
        enum: ['completed', 'inProgress'],
        default: 'inProgress'
    },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Project', projectSchema);