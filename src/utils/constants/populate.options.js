// user confidentials fields
const userConfidentialFields = '-password -verificationOTP';

// project populate options
const project = [
    {
        path: 'lead',
        select: userConfidentialFields
    },
    {
        path: 'memberOne',
        select: userConfidentialFields
    },
    {
        path: 'memberTwo',
        select: userConfidentialFields
    },
    {
        path: 'supervisor',
        select: userConfidentialFields
    },
];

// progress populate options
const progress = [
    {
        path: 'project',
        populate: project,
    },
];

// meeting populate options
const meeting = [
    {
        path: 'project',
        populate: project,
    },
];

export default { project, progress, meeting };