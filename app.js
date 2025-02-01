import { Router } from 'express';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

// registered routes
const routes = Router({ mergeParams: true });

// register routes
routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);

// export to register
export default routes;