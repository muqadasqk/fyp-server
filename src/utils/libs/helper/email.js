import { createTransport } from 'nodemailer';

import env from '../../../config/env.js';
import getHtmlTempalate from './get.html.template.js';
import tryCatch from './try.catch.js';

// create transporter instance
const transporter = createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: false,
    auth: {
        user: env.mail.user,
        pass: env.mail.pass,
    },
});

// send email with certain credentials
const send = async (email, options) => {
    const mailOptions = {
        from: `"FYP Management System" ${env.mail.user}`,
        to: email,
        subject: options.subject ?? "FYP Management System",
        attachments: options.attachments ?? []
    };

    if (options.template) { // send html template from views directory as email body
        mailOptions.html = await getHtmlTempalate(options.template, options);
    } else if (options.html) { // send html content received in options.html as email body
        mailOptions.html = options.html;
    } else { // send only text content received in options.text as email body
        mailOptions.text = options.text;
    }

    // send the email and wait
    return await tryCatch(() => transporter.sendMail(mailOptions));
};

export default { send }