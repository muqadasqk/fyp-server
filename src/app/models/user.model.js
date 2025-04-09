import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import rules from '../../utils/libs/validation/rules.js';
import { messages } from '../../utils/libs/validation/messages.js';
import env from '../../config/env.js';
import file from '../middlewares/file.js';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        validate: {
            validator: v => rules.string(v),
            message: messages.string.replace(":field", "name")
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: v => rules.email(v),
            message: messages.email
        },
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: v => rules.phone(v),
            message: messages.phone
        },
    },
    cnic: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: v => !v || rules.cnic(v),
            message: messages.cnic.replace(":field", "cnic")
        },
    },
    rollNo: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: v => !v || rules.rollNo(v),
            message: messages.rollNo.replace(":field", "roll no")
        },
    },
    role: {
        type: String,
        enum: ["admin", "supervisor", "student"],
        default: "supervisor",
    },
    image: {
        type: String,
        default: "images/default.jpg",
    },

    status: {
        type: String,
        enum: ["active", "inactive", "approvalPending", "rejected", "emailConfirmationPending", "phoneConfirmationPending"],
        default: "emailConfirmationPending"
    },
    password: {
        type: String,
        required: true,
        select: false // hidden on select query
    },

    verifiedAt: {
        type: Date,
        default: null
    },
}, { timestamps: true, versionKey: false });

// extra methods
UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    next();
});

UserSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    if (update?.password) {
        update.password = await bcrypt.hash(update.password, 10);
    }

    const user = await this.model.findOne(this.getFilter());
    if (user?.image && user.image !== "images/default.jpg") {
        file.delete(user.image);
    }

    next();
});


UserSchema.pre("findOneAndDelete", async function (next) {
    const user = await this.model.findOne(this.getQuery());
    if (user?.image && user.image !== "images/default.jpg") {
        file.delete(user.image);
    }

    next();
});

UserSchema.methods.comparePassword = function (passwordString) {
    return bcrypt.compare(String(passwordString), this.password);
};

UserSchema.statics.randomPassword = function (length = 8) {
    const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234(@$#!.%&)56789abcdefghijklmnopqrstuvwxyz";
    return Array.from({ length }, () => str[Math.floor(Math.random() * str.length)]).join("");
};

UserSchema.methods.generateToken = function (expiresAfter) {
    return jwt.sign({ id: this._id, }, env.app.secretKey, {
        expiresIn: expiresAfter,
    });
};

const User = mongoose.model("User", UserSchema);

User.on('index', async () => {
    if (!await User.findOne({ email: "admin@fyp-ms.com" })) User.create({
        name: "admin",
        email: "admin@fyp-ms.com",
        password: "admin",
        role: "admin",
        status: "active",
        verifiedAt: new Date()
    });
});

export default User;  