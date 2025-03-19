import { createTransport } from 'nodemailer';
import env from '../../../config/env.js';
import getHtmlTempalate from './get.html.template.js';

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
        from: `"FYP Management System" ${env.email.user}`,
        to: email,
        subject: options.subject.capEach() ?? 'FYP Managemenr System',
        html: await getHtmlTempalate(options.template, options),
    });
}

export default { send }