import dotenv from 'dotenv';

dotenv.config();
export default Object.freeze({
    server: {
        port: process.env.SERVER_PORT
    },

    app: {
        debug: process.env.APP_DEBUG
    },

    document: {
        count: process.env.DOCUMENT_COUNT
    },

    db: {
        url: process.env.DB_URL,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
    },

    secret: {
        key: process.env.SECRET_KEY
    },

    admin: {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD
    },

    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});