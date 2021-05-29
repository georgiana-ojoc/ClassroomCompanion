const {body} = require('express-validator');

const add = function () {
    return [
        body('description', 'Description (string) is required.').exists().notEmpty().isString(),
        body('severity', 'Severity (important or informative) is required.').exists().notEmpty()
            .isIn(['important', 'informative']),
        body('meetingDate', 'Meeting date should be date (dd.MM.yyyy).').optional().notEmpty().isDate(),
        body('meetingStart', 'Meeting start time should be time (hh:mm).').optional().notEmpty().isString()
            .custom(value => /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/gm.test(value)),
        body('meetingEnd', 'Meeting end time should be time (hh:mm).').optional().notEmpty().isString()
            .custom(value => /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/gm.test(value))
    ]
}

module.exports = {
    add
};