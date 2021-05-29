const {body} = require('express-validator');
const {StatusCodes} = require('http-status-codes');

const get = function (req, res, next) {
    const role = req.query.role;
    if (!['professor', 'student'].includes(role)) {
        const response = {

            message: 'Role (professor or student) is required.'
        };
        res.status(StatusCodes.BAD_REQUEST);
        res.end(JSON.stringify(response));
        return;
    }
    next();
}

const create = function () {
    return [
        body('name', 'Name (string) is required.').exists().notEmpty().isString(),
        body('subject', 'Subject (string) is required.').exists().notEmpty().isString()
    ];
}

module.exports = {
    get,
    create
};