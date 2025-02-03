import { Router } from 'express';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import progressRoutes from './routes/progress.routes.js';

// registered routes
const routes = Router({ mergeParams: true });

// register routes
routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);
routes.use('/projects', projectRoutes);
routes.use('/progresses', progressRoutes);

// export to register
export default routes;