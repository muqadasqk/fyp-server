import dotenv from 'dotenv';

dotenv.config();
export default Object.freeze({
    app: {
        origin: process.env.APP_ORIGIN,
        port: process.env.APP_PORT,
        secretKey: process.env.APP_SECRET_KEY,
        mode: process.env.APP_MODE,
    },

    db: {
        url: process.env.DB_URL,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
    },

    mail: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});