const router = require('express').Router();
const {studentController} = require('../controllers');

const {checkToken, getEmail} = require('../utils/checks');
const {logRequest} = require('../utils/logger');

const authorizationMiddlewares = [
    checkToken,
    getEmail,
    logRequest
];

router.post('/:classroomId/students', authorizationMiddlewares, studentController.join);
router.get('/:classroomId/students', authorizationMiddlewares, studentController.get);
router.delete('/:classroomId/students', authorizationMiddlewares, studentController.leave);

module.exports = router;