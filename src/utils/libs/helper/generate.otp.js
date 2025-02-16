import { generate } from "otp-generator";

// function to generate OTP with customizable options
const generateOTP = (length = 6, options = {}) => {
    return generate(length, {
        digits: options.digits ?? true,
        lowerCaseAlphabets: options.lower ?? false,
        upperCaseAlphabets: options.upper ?? false,
        specialChars: options.special ?? false
    });
};

export default generateOTP;
