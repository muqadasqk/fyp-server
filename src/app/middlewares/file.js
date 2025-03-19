import multer from "multer";
import crypto from 'crypto';
import path from "path";
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import httpCode from "../../utils/constants/http.code.js";
import tryCatch from "../../utils/libs/helper/try.catch.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// multer instance object 
const upload = multer({
    // set default storage for the files being uploaded
    storage: multer.diskStorage({

        // destination path where files will be uploaded
        destination: function (req, file, cb) {
            const uploadPath = path.join(__dirname, '../../assets/uploads');
            cb(null, uploadPath);
        },

        // renaming the file generating a unique hash string to avoid files being over-written
        filename: function (req, file, cb) {
            crypto.randomBytes(18, (error, buffer) => {
                cb(null, buffer.toString('hex') + path.extname(file.originalname));
            })
        },
    })
});

// method to upload file from cmoning HTTP request
const save = (name) => (req, res, next) => tryCatch(() => {
    // upload single file using multer storage object defined above
    const uploadMiddleware = upload.single(name);

    // another middleware to check if the file upload was successful
    uploadMiddleware(req, res, (error) => {
        // return back with server error response
        if (error) return res.response(error.statusCode ?? httpCode.SERVER_ERROR, `Error uploading ${name}`, error);

        // once the file is uploaded 
        if (req.file) {
            // add a new key-value for uploaded file into request body object with file name, size and mimetype
            req.body[name] = {
                name: req.file.filename,
                extension: req.file.filename.split('.').last(),
                size: req.file.size / 1024,
            }

            // delete 'file' from request object
            delete req.file;

            // if there is no file uploaded add blank value for file key into request body object
        } else req.body[name] = '';

        next();
    });
});

// method to delete uploaded file from public/uploaded
const del = (name) => {
    // generate absolute path to located file
    const filepath = path.join(__dirname, '../../assets/uploads', name);

    // delete file if exists
    if (fs.existsSync(filepath)) tryCatch(() => {
        fs.unlinkSync(filepath);
    });
};

// method to allow application to process request body object with any binary file
const none = multer({ dest: '/none' }).none();

export default { save, delete: del, none };