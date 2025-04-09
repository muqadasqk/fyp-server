import mongoose from 'mongoose';

import rules from '../../utils/libs/validation/rules.js';

const ProposalSchema = new mongoose.Schema({
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
            validator: v => rules.word(v, { min: 200, max: 350 }),
            message: 'The abstract must be between 200 and 350 words'
        },
    },
    remarks: {
        type: String,
        validate: {
            validator: v => !v || rules.word(v, { min: 5, max: 350 }),
            message: 'The remarks must be between 5 and 350 words'
        },
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
        enum: ['accepted', 'conditionallyAccepted', 'rejected', 'pending'],
        default: 'pending'
    },
}, { timestamps: true, versionKey: false });

const Proposal = mongoose.model('Proposal', ProposalSchema);
export default Proposal;