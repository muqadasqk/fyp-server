// project populate options
const project = [
    {
        path: 'lead',
        select: '-password -verificationOTP',
    },
    {
        path: 'memberOne',
        select: '-password -verificationOTP',
    },
    {
        path: 'memberTwo',
        select: '-password -verificationOTP',
    },
    {
        path: 'supervisor',
        select: '-password -verificationOTP',
    },
];

// progress populate options
const progress = [
    {
        path: 'project',
        populate: project,
    },
];

export default { project, progress };