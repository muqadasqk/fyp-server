import validationMessage from './messages.js';
import Rules from './rules.js';

export default async (data, rules) => {
    // initialize empty errors object
    const errors = {};

    // iterate over every field 
    for (const field in rules) {

        // corresponding field value from data
        let value = data[field];

        // iterate over each validation rule to certain field
        for (const [rule, ruleValue] of Object.entries(rules[field])) {

            // proceed optional 
            if (rule === "optional" && ruleValue && !value) continue;

            // apply rule check push error if rule fails
            if ((rule == "required" && !value) || (!errors[field] && value && !(await Rules[rule](value, ruleValue)))) {

                // retrieve certain rule failure message string
                errors[field] = await validationMessage(rule, { field, value, [rule]: ruleValue, });
            }
        }
    }

    // object with all errors and variable holding boolean value to express whether validation was failed or not
    return { errors, validationFailed: Object.keys(errors).length > 0 };
}