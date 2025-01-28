import { Router } from 'express';
import authRoutes from './routes/auth.routes.js';

// registered routes
const routes = Router({ mergeParams: true });

// register routes
routes.use('/auth', authRoutes);

// export to register
export default routes;