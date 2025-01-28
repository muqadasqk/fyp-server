import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 6,
        maxlength: 255
    },
    nic: {
        type: String,
        required: true,
        unique: true,
        validate: { validator: v => /^\d{13}$/.test(v) }
    },
    rollNo: {
        type: String,
        unique: true,
        validate: { validator: v => /^[0-9]{2}[a-zA-Z]{2}[0-9]{3}$/.test(v) }
    },
    role: {
        type: String,
        enum: ['admin', 'supervisor', 'student'],
        default: 'supervisor',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'verification-pending'],
        default: 'verification-pending'
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    verificationOTP: {
        type: String,
    },
}, { timestamps: true, versionKey: false });

userSchema.post('updateOne', async function () {
    await mongoose.model('Project').updateMany({ lead: this._id }, { $set: { lead: this._update.$set._id } });
    await mongoose.model('Project').updateMany({ memberOne: this._id }, { $set: { memberOne: this._update.$set._id } });
    await mongoose.model('Project').updateMany({ memberTwo: this._id }, { $set: { memberTwo: this._update.$set._id } });
    await mongoose.model('Project').updateMany({ supervisor: this._id }, { $set: { supervisor: this._update.$set._id } });
});

userSchema.post('remove', async function () {
    await mongoose.model('Project').updateMany({ lead: this._id }, { $unset: { lead: 1 } });
    await mongoose.model('Project').updateMany({ memberOne: this._id }, { $unset: { memberOne: 1 } });
    await mongoose.model('Project').updateMany({ memberTwo: this._id }, { $unset: { memberTwo: 1 } });
    await mongoose.model('Project').updateMany({ supervisor: this._id }, { $unset: { supervisor: 1 } });
});

export default mongoose.model('User', userSchema);