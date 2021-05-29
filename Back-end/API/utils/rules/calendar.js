const {body} = require('express-validator');

const create = function () {
    return [
        body('title', 'Title (string) is required.').exists().notEmpty().isString(),
        body('day', 'Day (Monday, Tuesday, Wednesday, Thursday or Friday) is required.').exists()
            .notEmpty().isString()
            .custom(value => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(value)),
        body('start', 'Start time (hh:mm) is required.').exists().notEmpty().isString()
            .custom(value => /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/gm.test(value)),
        body('end', 'End time (hh:mm) is required.').exists().notEmpty().isString()
            .custom(value => /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/gm.test(value))
    ];
}

module.exports = {
    create
};