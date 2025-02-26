// user confidentials fields
const userConfidentialFields = '-password -verificationOTP';

// project populate options
const proposal = [
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
];
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

// presentation populate options
const presentation = [
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

export default { proposal, project, presentation, meeting };