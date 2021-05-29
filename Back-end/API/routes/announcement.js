const router = require('express').Router();
const {announcementController} = require('../controllers');

const {checkToken, getEmail, checkJSONContentTypeHeader, checkBody} = require('../utils/checks');
const {logRequest} = require('../utils/logger');
const {add} = require('../utils/rules/announcement');

const authorizationMiddlewares = [
    checkToken,
    getEmail,
    logRequest
];

const addMiddlewares = [
    checkJSONContentTypeHeader,
    checkBody,
    logRequest
]

router.post('/:classroomId/announcements', authorizationMiddlewares, addMiddlewares, add(), announcementController
    .add);
router.get('/:classroomId/announcements', authorizationMiddlewares, announcementController.get);
router.get('/:classroomId/announcements/:announcementId', authorizationMiddlewares, announcementController.getById);
router.delete('/:classroomId/announcements/:announcementId', authorizationMiddlewares, announcementController
    .removeAnnouncement);

module.exports = router;