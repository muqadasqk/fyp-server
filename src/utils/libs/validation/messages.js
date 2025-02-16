import tryCatch from "../helper/try.catch.js";

export const messages = {
    required: "The :field is required",
    email: "The provided email address is invalid",
    string: "The :field must contain only letters",
    number: "The :field must contain only digits",
    password: "Password must contain uppercase, lowercase, special character, and digit",
    regex: 'The :field contains invalid format. Please check your input',

    filesize: "The file size must not exceed :filesize MBs",
    mongooseId: "The :field must be a valid moongose ID",
    unique: "The :field :value is already taken",
    exists: "The :field :value is invalid",

    rollNo: "The :field must be in the format (21SW066)",
    nic: 'the :field must be exactly 13 digits',

    word: "The :field must be between :min and :max words",
    same: "The :field should be the same as :same",
    in: "The :field must be one of the following (:in)",
    min: "The :field must be at least :min characters",
    max: "The :field must not exceed :max characters",
    minDigit: "The :field must contain at least :minDigit digits",
    maxDigit: "The :field must contain no more than :maxDigit digits",
    size: "The :field must be exactly :size characters",
    extension: "The :field must be in one of the following extensions (:extension)",
};

const validationMessage = (rule, options) => tryCatch(() => {
    return messages[rule]
        .replace(/:field\b/g, options.field.splitCamelCase())
        .replace(/:value\b/g, options.value)
        .replace(/:same\b/g, options.same && Object.keys(options.same).first())
        .replace(/:min\b/g, options.min ?? options[rule].min)
        .replace(/:max\b/g, options.max ?? options[rule].max)
        .replace(/:minDigit\b/g, options.minDigit)
        .replace(/:maxDigit\b/g, options.maxDigit)
        .replace(/:size\b/g, options.size)
        .replace(/:filesize\b/g, options.filesize && (options.filesize / 1024).toFixed(2))
        .replace(/:extension\b/g, options.extension && options.extension.join(', '))
        .replace(/:in\b/g, options.in && options.in.join(', '));
});

export default validationMessage;