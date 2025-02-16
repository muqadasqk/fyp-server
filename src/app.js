import { Router } from 'express';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import progressRoutes from './routes/progress.routes.js';

// registered routes
const apiRoutes = Router({ mergeParams: true });

// register routes
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/projects', projectRoutes);
apiRoutes.use('/progresses', progressRoutes);

// export to register
export default apiRoutes;