import mongoose from 'mongoose';
import rules from '../../utils/libs/validation/rules.js';
import { messages } from '../../utils/libs/validation/messages.js';
import password from '../../utils/libs/helper/password.js';

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
        required: true
    },

    nic: {
        type: String,
        unique: true,
        validate: {
            validator: v => !v || rules.nic(v),
            message: messages.nic.replace(':field', 'nic')
        },
        sparse: true,
        default: null,
    },
    rollNo: {
        type: String,
        unique: true,
        validate: {
            validator: v => !v || rules.rollNo(v),
            message: messages.rollNo.replace(':field', 'roll no')
        },
        sparse: true,
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'supervisor', 'student'],
        default: 'supervisor',
    },
    image: {
        type: String,
        default: 'default.jpg',
    },

    status: {
        type: String,
        enum: ['active', 'inactive', 'verificationPending'],
        default: 'verificationPending'
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

const user = mongoose.model('User', userSchema);
user.on('index', async () => {
    if (!await user.findOne({ email: "admin@fyp-ms.com" })) user.create({
        name: "admin",
        email: "admin@fyp-ms.com",
        password: await password.createHash('admin'),
        role: "admin",
        status: "active",
        verifiedAt: new Date()
    });
});

export default user;  