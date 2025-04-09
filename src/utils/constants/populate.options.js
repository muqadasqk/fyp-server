// project populate options
const proposal = [
    {
        path: 'lead',
    },
    {
        path: 'memberOne',
    },
    {
        path: 'memberTwo',
    },
    {
        path: 'supervisor',
    },
];
// project populate options
const project = proposal;

// presentation populate options
const presentation = [
    {
        path: 'project',
        populate: project,
    },
];

// meeting populate options
const meeting = presentation;

export default { proposal, project, presentation, meeting };