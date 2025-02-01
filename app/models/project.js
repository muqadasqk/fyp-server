import mongoose from 'mongoose';
import rules from '../../utils/validation/rules.js';

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
        default: null,
        validate: { validator: v => rules.word(v, { min: 200, max: 350 }) }
    },
    status: {
        type: String,
        enum: ['project', 'accepted', 'conditionally-accepted', 'rejected', 'pending'],
        default: 'pending'
    },

    remarks: {
        type: String,
        default: null,
    },
    proposal: {
        type: String,
        default: null,
    },
}, { timestamps: true, versionKey: false });

export default mongoose.model('Project', projectSchema);