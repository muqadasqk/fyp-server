import mongoose from 'mongoose';
import rules from '../../utils/libs/validation/rules.js';

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
            validator: v => !v || rules.word(v, { min: 200, max: 350 }),
            message: 'The abstract must be between 200 and 350 words'
        },
        default: null,
    },
    proposal: {
        type: String,
        default: null,
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
        enum: ['project', 'accepted', 'conditionally-accepted', 'rejected', 'pending'],
        default: 'pending'
    },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Project', projectSchema);