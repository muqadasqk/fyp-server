import cron from "node-cron";

import file from "../../../app/middlewares/file.js";
import Project from "../../../app/models/project.model.js";
import Presentation from "../../../app/models/presentation.model.js";

// schedule cleanup every midnight
cron.schedule('0 0 * * *', async () => {
    // check and delete expired projects and their proposal files
    const expiredProjects = await Project.find({ expiresAt: { $lte: new Date() } });
    for (const project of expiredProjects) {
        if (project?.proposal) file.delete(project.proposal);
        await project.deleteOne();
    }

    // check and delete expired presentations and their resource files
    const expiredPresentations = await Presentation.find({ expiresAt: { $lte: new Date() } });
    for (const presentation of expiredPresentations) {
        if (presentation?.resource) file.delete(presentation.resource);
        await presentation.deleteOne();
    }
});