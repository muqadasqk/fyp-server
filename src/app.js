import { Router } from 'express';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import progressRoutes from './routes/progress.routes.js';
import meetingRoutes from './routes/meeting.routes.js';

// registered routes
const apiRoutes = Router({ mergeParams: true });

// register routes
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/projects', projectRoutes);
apiRoutes.use('/progresses', progressRoutes);
apiRoutes.use('/meetings', meetingRoutes);

// export to register
export default apiRoutes;