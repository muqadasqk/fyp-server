export default Object.freeze({
    DATA: {
        ALL: model => `All ${model} records have been retrieved`,
        ONE: model => `The requested ${model} record has been retrieved`,
        DELETED: model => `${model} record has been deleted`,
        UPDATED: model => `${model} record has been updated`,
        CREATED: model => `A new ${model} record has been created`,
        FAILED: (action, model) => `Failed to ${action} the ${model} record`,
    },

    VALIDATION: {
        TAKEN: ({ key, value }) => `${key} '${value}' is already taken`,
        INVALID_ID: model => `Invalid ${model} ID`,
        FAILS: 'Validation failed. Please check your inputs',
    },

    ACCOUNT: {
        NOT_ACTIVE: 'Account not active. Check your login credentials or contact support',
        INVALID: 'Account not found. You can register for a new account now',
    },

    AUTHENTICATION: {
        SUCCESS: 'Login successful!',
        FAILED: 'Invalid email or password. Please try again',
        ADMIN_FAILED: 'Invalid username or password. Please try again',
        GRANTED: 'Admin authorization granted',
    },

    REGISTRATION: {
        SUCCESS: 'Registration successful!',
    },

    OTP: {
        SENT: 'OTP sent to your email',
        FAILED: 'Failed to send OTP. Please try reseding',
        VFAILED: 'Invalid OTP. Please try again',
        VSUCCESS: 'OTP verified successfully!',
    },

    PASSWORD: {
        RESET_SUCCESS: 'Password reset successful',
        RESET_FAILED: 'Password reset failed. Please try again',
        UPDATE_SUCCESS: 'Password updated successfully',
        UPDATE_FAILED: 'The old password is incorrect',
    },

    USER: {
        UPDATED_SUCCESS: 'User account updated successfully',
        DELETED_SUCCESS: 'User account deleted successfully',
        REGISTRATION_FAILED: 'User registration failed. Please try again',
    },

    MISC: {
        ACCESS_DENIED: 'Unauthenticated',
        FORBIDDEN: 'Access forbidden',
        INTERNAL_ERROR: 'An internal error occurred',
    },
})