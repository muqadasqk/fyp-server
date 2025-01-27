import mongoose from 'mongoose';
import environment from './env.js';
import { tryCatch } from '../utils/functions.js';

const connect = async () => tryCatch(async () => {
    const databaseURL = `${environment.db.url}:${environment.db.port}/${environment.db.name}`;
    await mongoose.connect(databaseURL);
});

const connection = mongoose.connection;

export default { connect, connection };