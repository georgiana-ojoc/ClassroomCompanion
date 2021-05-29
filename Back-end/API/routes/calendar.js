const router = require('express').Router();
const {calendarController} = require('../controllers');

const {checkToken, getEmail, checkJSONContentTypeHeader, checkBody} = require('../utils/checks');
const {create} = require('../utils/rules/calendar');
const {logRequest} = require('../utils/logger');

const authorizationMiddlewares = [
    checkToken,
    getEmail,
    logRequest
];

const createMiddlewares = [
    checkJSONContentTypeHeader,
    checkBody,
    logRequest
];

router.post('/', authorizationMiddlewares, createMiddlewares, create(), calendarController.createEvent);
router.get('/', authorizationMiddlewares, calendarController.getEvents);
router.get('/:eventId', authorizationMiddlewares, calendarController.getEvent);
router.delete('/:eventId', authorizationMiddlewares, calendarController.deleteEvent);

module.exports = router;