import mongoose from 'mongoose';
import rules from '../../utils/libs/validation/rules.js';
import { messages } from '../../utils/libs/validation/messages.js';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        validate: {
            validator: v => rules.string(v),
            message: messages.string.replace(':field', 'name')
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 6,
        maxlength: 255,
        validate: {
            validator: v => rules.email(v),
            message: messages.email
        },
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: v => rules.password(v),
            message: messages.password
        },
    },

    nic: {
        type: String,
        unique: true,
        validate: {
            validator: v => !v ?? rules.nic(v),
            message: messages.nic.replace(':field', 'nic')
        },
        sparse: true,
        default: null,
    },
    rollNo: {
        type: String,
        unique: true,
        validate: {
            validator: v => !v ?? rules.rollNo(v),
            message: messages.rollNo.replace(':field', 'roll no')
        },
        sparse: true,
        default: null
    },
    role: {
        type: String,
        enum: ['supervisor', 'student'],
        default: 'supervisor',
    },
    image: {
        type: String,
        default: 'default.jpg',
    },

    status: {
        type: String,
        enum: ['active', 'inactive', 'verification-pending'],
        default: 'verification-pending'
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    verificationOTP: {
        type: String,
        default: null
    },
}, { timestamps: true, versionKey: false });

export default mongoose.model('User', userSchema);