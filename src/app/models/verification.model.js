import mongoose from 'mongoose';
import speakeasy from "speakeasy";

import rules from '../../utils/libs/validation/rules.js';
import { messages } from '../../utils/libs/validation/messages.js';
import userService from '../services/user.service.js';

const VerificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: v => rules.email(v),
            message: messages.email
        }
    },
    secret: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 },
        validate: {
            validator: v => v > new Date(),
            message: "Expiration time must be in the future"
        }
    },
}, { versionKey: false });

// methods
VerificationSchema.statics.generate = async function (email, expiresAfter = 2) {
    const secret = speakeasy.generateSecret({ length: 20 }).base32;

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresAfter);

    const existing = await this.findOne({ email });

    if (existing) {
        await existing.updateOne({ secret, expiresAt });
    } else {
        await this.create({ email, secret, expiresAt });
    }

    return speakeasy.totp({
        secret,
        encoding: "base32",
        digits: 6,
    });
}

VerificationSchema.statics.verify = async function (email, otpCode, { onSuccess = null, isSignupEmailConfirmation = false } = {}) {
    const verification = await this.findOne({ email });

    if (!verification) {
        return { status: 404, message: "OTP has expired. Please request a new one" };
    }

    const isValid = speakeasy.totp.verify({
        secret: verification.secret,
        encoding: "base32",
        token: otpCode,
        window: 1,
    });

    if (!isValid) {
        return { status: 400, message: "Invalid OTP. Please try again" };
    }

    if (isSignupEmailConfirmation) {
        const data = { status: "approvalPending", verifiedAt: Date.now() };
        await userService.update({ email }, data);
    }

    await verification.deleteOne();
    return { status: 200, message: onSuccess ?? "OTP verified successfully" };
};

const Verification = mongoose.model('Verification', VerificationSchema);
export default Verification;
