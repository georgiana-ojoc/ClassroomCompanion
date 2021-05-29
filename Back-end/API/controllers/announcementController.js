const {Classrooms, Announcements} = require('../models');
const {createMeeting} = require('../utils/meeting');
const {deleteEvent} = require('../utils/calendar');
const {getNow} = require('../utils/time');
const {logSuccessResponse, logFailedResponse, logNewAnnouncement} = require('../utils/logger');
const {runCallback} = require('../utils/oAuth');
const {StatusCodes} = require('http-status-codes');
const config = require('config');

const scope = config.get('calendar').scope;

const add = async function (req, res) {
    const email = res.locals.email;
    const id = req.params.classroomId;
    if (id === undefined || id === null || id === '') {
        const response = {
            message: 'Classroom not found'
        }
        res.status(StatusCodes.NOT_FOUND);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
    } else {
        const classroom = await Classrooms.findByPk(id);
        if (classroom === null) {
            const response = {
                message: 'Classroom not found.'
            };
            res.status(StatusCodes.NOT_FOUND);
            res.end(JSON.stringify(response));
            logFailedResponse(req, response);
        } else if (classroom.professor !== email) {
            const response = {
                message: 'User not professor of the specified classroom.'
            }
            res.status(StatusCodes.FORBIDDEN);
            res.end(JSON.stringify(response));
            logFailedResponse(req, response);
        } else {
            const description = req.body.description;
            const severity = req.body.severity;
            const meetingDate = req.body.meetingDate;
            const meetingStart = req.body.meetingStart;
            const meetingEnd = req.body.meetingEnd;
            if (meetingDate !== undefined && meetingDate !== null && meetingDate !== "" &&
                meetingStart !== undefined && meetingStart !== null && meetingStart !== "" &&
                meetingEnd !== undefined && meetingEnd !== null && meetingEnd !== "") {
                const meeting = await runCallback(req, res, email, scope, createMeeting, global.oAuth2Client,
                    description, meetingDate, meetingStart, meetingEnd);
                if (meeting !== null) {
                    let announcement = await Announcements.create({
                        classroomId: id,
                        description: description,
                        severity: severity,
                        meetingId: meeting.id,
                        meetingLink: meeting.link,
                        meetingDate: meetingDate,
                        meetingStart: meetingStart,
                        meetingEnd: meetingEnd,
                        created: getNow()
                    });
                    announcement = announcement.toJSON();
                    res.status(StatusCodes.CREATED);
                    res.end(JSON.stringify(announcement));
                    logSuccessResponse(req, announcement);
                }
            } else {
                let announcement = await Announcements.create({
                    classroomId: id,
                    description: description,
                    severity: severity,
                    meetingId: null,
                    meetingLink: null,
                    meetingDate: null,
                    meetingStart: null,
                    meetingEnd: null,
                    created: getNow()
                });
                announcement = announcement.toJSON();
                logNewAnnouncement(announcement.classroomId);
                res.status(StatusCodes.CREATED);
                res.end(JSON.stringify(announcement));
                logSuccessResponse(req, announcement);
            }
        }
    }
}

const get = async function (req, res) {
    const id = req.params.classroomId;
    if (id === undefined || id === null || id === '') {
        const response = {
            message: 'Classroom not found.'
        };
        res.status(StatusCodes.NOT_FOUND);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
    } else {
        const classroom = await Classrooms.findByPk(id);
        if (classroom === null) {
            const response = {
                message: 'Classroom not found.'
            };
            res.status(StatusCodes.NOT_FOUND);
            res.end(JSON.stringify(response));
            logFailedResponse(req, response);
        } else {
            const severity = req.query.severity;
            let results;
            if (severity === 'important' || severity === 'informative') {
                results = await Announcements.findAll({
                    where: {
                        classroomId: id,
                        severity: severity
                    },
                    order: [
                        ['created_at', 'DESC']
                    ]
                });
            } else {
                results = await Announcements.findAll({
                    where: {
                        classroomId: id
                    },
                    order: [
                        ['created_at', 'DESC']
                    ]
                });
            }
            let announcements = [];
            results.forEach(result => {
                announcements.push({
                    id: result.id,
                    classroomId: result.classroomId,
                    description: result.description,
                    severity: result.severity,
                    meetingId: result.meetingId,
                    meetingLink: result.meetingLink,
                    meetingDate: result.meetingDate,
                    meetingStart: result.meetingStart,
                    meetingEnd: result.meetingEnd,
                    created: result.created
                })
            });
            res.status(StatusCodes.OK);
            res.end(JSON.stringify(announcements));
            logSuccessResponse(req, announcements);
        }
    }
}

const getById = async function (req, res) {
    const classroomId = req.params.classroomId;
    const announcementId = req.params.announcementId;
    if (classroomId === undefined || classroomId === null || classroomId === '') {
        const response = {
            message: 'Classroom not found.'
        };
        res.status(StatusCodes.NOT_FOUND);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
    } else {
        const classroom = await Classrooms.findByPk(classroomId);
        if (classroom === null) {
            const response = {
                message: 'Classroom not found.'
            };
            res.status(StatusCodes.NOT_FOUND);
            res.end(JSON.stringify(response));
            logFailedResponse(req, response);
        } else {
            const result = await Announcements.findOne({
                where: {
                    id: announcementId,
                    classroomId: classroomId
                }
            });
            if (result === null) {
                const response = {
                    message: 'Announcement not found.'
                };
                res.status(StatusCodes.NOT_FOUND);
                res.end(JSON.stringify(response));
                logFailedResponse(req, response);
            } else {
                const announcement = {
                    id: result.id,
                    classroomId: result.classroomId,
                    description: result.description,
                    severity: result.severity,
                    meetingId: result.meetingId,
                    meetingLink: result.meetingLink,
                    meetingDate: result.meetingDate,
                    meetingStart: result.meetingStart,
                    meetingEnd: result.meetingEnd,
                    created: result.created
                }
                res.status(StatusCodes.OK);
                res.end(JSON.stringify(announcement));
                logSuccessResponse(req, announcement);
            }
        }
    }
}

const removeAnnouncement = async function (req, res) {
    const email = res.locals.email;
    const classroomId = req.params.classroomId;
    const announcementId = req.params.announcementId;
    if (classroomId === undefined || classroomId === null || classroomId === '') {
        const response = {
            message: 'Classroom not found.'
        };
        res.status(StatusCodes.NOT_FOUND);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
    } else {
        const classroom = await Classrooms.findByPk(classroomId);
        if (classroom === null) {
            const response = {
                message: 'Classroom not found.'
            };
            res.status(StatusCodes.NOT_FOUND);
            res.end(JSON.stringify(response));
            logFailedResponse(req, response);
        } else if (classroom.professor !== email) {
            const response = {
                message: 'User not professor of the specified classroom.'
            };
            res.status(StatusCodes.FORBIDDEN);
            res.end(JSON.stringify(response));
            logFailedResponse(req, response);
        } else {
            if (announcementId === undefined || announcementId === null || announcementId === '') {
                const response = {
                    message: 'Announcement not found.'
                };
                res.status(StatusCodes.NOT_FOUND);
                res.end(JSON.stringify(response));
                logFailedResponse(req, response);
            } else {
                const announcement = await Announcements.findByPk(announcementId);
                if (announcement === null) {
                    const response = {
                        message: 'Announcement not found.'
                    };
                    res.status(StatusCodes.NOT_FOUND);
                    res.end(JSON.stringify(response));
                    logFailedResponse(req, response);
                } else {
                    const meetingId = announcement.meetingId;
                    if (meetingId !== null) {
                        const event = await runCallback(req, res, email, scope, deleteEvent, global.oAuth2Client,
                            meetingId);
                        if (event !== null) {
                            await Announcements.destroy({
                                where: {
                                    id: announcementId
                                }
                            });
                            const response = {
                                message: 'Announcement removed successfully.'
                            };
                            res.status(StatusCodes.NO_CONTENT);
                            res.end(JSON.stringify(response));
                            logSuccessResponse(req, response);
                        }
                    } else {
                        await Announcements.destroy({
                            where: {
                                id: announcementId
                            }
                        });
                        const response = {
                            message: 'Announcement removed successfully.'
                        };
                        res.status(StatusCodes.NO_CONTENT);
                        res.end(JSON.stringify(response));
                        logSuccessResponse(req, response);
                    }
                }
            }
        }
    }
}

module.exports = {
    add,
    get,
    getById,
    removeAnnouncement
}