const router = require('express').Router();
const {scheduleController} = require('../controllers');

const {checkToken, getEmail, checkJSONContentTypeHeader, checkBody} = require('../utils/checks');
const {logRequest} = require('../utils/logger');
const {add} = require('../utils/rules/schedule');

const authorizationMiddlewares = [
    checkToken,
    getEmail,
    logRequest
];

const addMiddlewares = [
    checkJSONContentTypeHeader,
    checkBody,
    logRequest
];

router.post('/:classroomId/schedules', authorizationMiddlewares, addMiddlewares, add(), scheduleController.add);
router.get('/:classroomId/schedules', authorizationMiddlewares, scheduleController.get);
router.get('/:classroomId/schedules/:scheduleId', authorizationMiddlewares, scheduleController.getById);
router.delete('/:classroomId/schedules/:scheduleId', authorizationMiddlewares, scheduleController.removeSchedule);

module.exports = router;