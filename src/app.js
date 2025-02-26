import { Router } from 'express';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import proposalRoutes from './routes/proposal.routes.js';
import projectRoutes from './routes/project.routes.js';
import presentationRoutes from './routes/presentation.routes.js';
import meetingRoutes from './routes/meeting.routes.js';

// registered routes
const apiRoutes = Router({ mergeParams: true });

// register routes
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/proposals', proposalRoutes);
apiRoutes.use('/projects', projectRoutes);
apiRoutes.use('/presentations', presentationRoutes);
apiRoutes.use('/meetings', meetingRoutes);

// export to register
export default apiRoutes;