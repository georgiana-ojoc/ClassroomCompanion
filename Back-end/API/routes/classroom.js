const router = require('express').Router();
const {classroomController} = require('../controllers');

const {checkToken, getEmail, checkQuery, checkJSONContentTypeHeader, checkBody} = require('../utils/checks');
const {get, create} = require('../utils/rules/classroom');
const {logRequest} = require('../utils/logger');

const authorizationMiddlewares = [
    checkToken,
    getEmail,
    logRequest
];

const getMiddlewares = [
    checkQuery,
    get,
    logRequest
];

const createMiddlewares = [
    checkJSONContentTypeHeader,
    checkBody,
    logRequest
];

router.post('', authorizationMiddlewares, createMiddlewares, create(), classroomController.create);
router.get('', authorizationMiddlewares, getMiddlewares, classroomController.get);
router.get('/:classroomId', authorizationMiddlewares, classroomController.getById);
router.delete('/:classroomId', authorizationMiddlewares, classroomController.deleteClassroom);

module.exports = router;