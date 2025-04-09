import mongoose from 'mongoose';

import env from './env.js';
import tryCatch from '../utils/libs/helper/try.catch.js';

const connect = async () => tryCatch(async () => {
    const databaseURL = `${env.db.url}:${env.db.port}/${env.db.name}`;
    await mongoose.connect(databaseURL);
});

export default { connect };