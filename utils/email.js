import { createTransport } from 'nodemailer';
import env from '../config/env.js';
import { generateEmailTempalate } from './functions.js';

// create transporter instance
const transporter = createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: false,
    auth: {
        user: env.email.user,
        pass: env.email.pass,
    },
});

// send email with certain credentials
const send = async (email, options) => {
    return await transporter.sendMail({
        from: env.email.user,
        to: email,
        subject: options.subject ?? 'OTP verification',
        html: await generateEmailTempalate(options.template, options),
    });
}

export default { send }