import multer from "multer";
import crypto from 'crypto';
import path from "path";
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import tryCatch from "../../utils/libs/helper/try.catch.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// default directories
const FILE_TYPE_DIRS = {
    image: "images",
    audio: "audios",
    video: "videos",
    text: "documents",
    application: "applications",
    default: "others"
};

// function to determine file type category
const getFileCategory = (mimeType) => {
    if (mimeType.startsWith("image/")) return FILE_TYPE_DIRS.image;
    if (mimeType.startsWith("video/")) return FILE_TYPE_DIRS.video;
    if (mimeType.startsWith("application/")) return FILE_TYPE_DIRS.application;
    if (mimeType.startsWith("audio/")) return FILE_TYPE_DIRS.audio;
    if (mimeType.startsWith("text/")) return FILE_TYPE_DIRS.text;
    return FILE_TYPE_DIRS.default;
};

// multer instance object 
const upload = multer({
    // set default storage for the files being uploaded
    storage: multer.diskStorage({
        // destination path where files will be uploaded create if doesn't exit
        destination: function (req, file, cb) {
            // determine the upload directory based on file type
            const dirname = getFileCategory(file.mimetype);
            const uploadPath = path.join(__dirname, `../../assets/${dirname}`);

            // set the directory or create it first if doesn't exists
            fs.mkdir(uploadPath, { recursive: true }, (err) => {
                if (err) return cb(err, null);
                cb(null, uploadPath);
            });
        },

        // renaming the file generating a unique hash string to avoid files being over-written
        filename: function (req, file, cb) {
            // determine the directory baed on file type
            const dirname = getFileCategory(file.mimetype);

            // generate unique hashed string password
            crypto.randomBytes(18, (error, buffer) => {
                if (error) return cb(error, null);
                cb(null, buffer.toString('hex') + path.extname(file.originalname));
            })
        },
    })
});

// method to upload file from cmoning HTTP request
const save = (fieldsOrField, count = 1) => (req, res, next) => tryCatch(() => {
    // upload middleware
    let middleware;

    // upload file(s) using multer storage object defined above
    if (typeof fieldsOrField === "string") {
        if (count > 1) {
            middleware = upload.array(fieldsOrField, count);
        } else {
            middleware = upload.single(fieldsOrField);
        }
    } else if (typeof fieldsOrField === "object") {
        const keys = Object.keys(fieldsOrField);
        middleware = upload.fields(
            keys.map((key) => ({ name: key, maxCount: fieldsOrField[key] || 1 }))
        );
    }

    // local method to extract, set and return file details for using later in the middleware/controller logic
    const fileDetails = ({ filename, mimetype, size }) => ({
        name: getFileCategory(mimetype) + "/" + filename,
        extension: mimetype.split("/")[1],
        size: Number(Math.ceil(size / 1024).toFixed(0)),
    });

    // once the file is uploaded 
    middleware(req, res, (error) => {
        // there is error(s) return back with error response
        if (error) return res.response(error.statusCode ?? 500, "Error uploading file", { error });

        // field with single file upload
        if (req.file) {
            // req.files = { [fieldsOrField]: fileDetails(req.file) };
            req.body[fieldsOrField] = fileDetails(req.file);
        };

        // field with multiple file uploads
        if (req.files && Array.isArray(req.files)) {
            const files = req.files.map(fileDetails);
            // req.files = { [fieldsOrField]: files };
            req.body[fieldsOrField] = files;
        }

        // if there were multiple files uploaded as object
        if (req.files && typeof req.files === "object") {
            Object.entries(req.files).forEach(([key, info]) => {
                const fileInfo = (fieldsOrField[key] <= 1)
                    ? info.map(fileDetails)[0]
                    : info.map(fileDetails);

                // req.files = { ...req.files, [key]: fileInfo };
                req.body[key] = fileInfo;
            });
        };

        // add an empy field to counter errors
        if (!req.body[fieldsOrField]) {
            req.body[fieldsOrField] = "";
        }

        next();
    });
});

// method to delete uploaded file from src/assets/uploaded
const del = (filename) => {
    // generate absolute path to located file
    const filepath = path.join(__dirname, "../../assets", filename);

    // delete file if exists
    if (fs.existsSync(filepath)) {
        fs.unlink(filepath, (error) => {
            if (error) throw error;
        });
    }
};

// method to allow application to process request body object with any binary file
const none = upload.none();

export default { save, delete: del, none };