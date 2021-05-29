const {Classrooms, Schedules} = require('../models');
const {logSuccessResponse, logFailedResponse} = require('../utils/logger');
const {StatusCodes} = require('http-status-codes');

const add = async function (req, res) {
    const email = res.locals.email;
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
        } else if (classroom.professor !== email) {
            const response = {
                message: 'User not professor of the specified classroom.'
            };
            res.status(StatusCodes.FORBIDDEN);
            res.end(JSON.stringify(response));
            logFailedResponse(req, response);
        } else {
            const day = req.body.day;
            const start = req.body.start;
            const end = req.body.end;

            if (start >= end) {
                const response = {
                    message: 'End time should be after start time.'
                };
                res.status(StatusCodes.BAD_REQUEST);
                res.end(JSON.stringify(response));
                logFailedResponse(req, response);
            } else {
                let [schedule, created] = await Schedules.findOrCreate({
                    where: {
                        classroomId: id,
                        day: day,
                        start: start,
                        end: end
                    },
                    defaults: {
                        classroomId: id,
                        day: day,
                        start: start,
                        end: end
                    }
                });
                if (!created) {
                    const response = {
                        message: 'Schedule already exists.'
                    };
                    res.status(StatusCodes.CONFLICT);
                    res.end(JSON.stringify(response));
                    logFailedResponse(req, response);
                } else {
                    schedule = schedule.toJSON();
                    res.status(StatusCodes.CREATED);
                    res.end(JSON.stringify(schedule));
                    logSuccessResponse(req, schedule);
                }
            }
        }
    }
};

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
            const results = await Schedules.findAll({
                where: {
                    classroomId: id
                }
            });
            let schedules = [];
            results.forEach(result => {
                schedules.push({
                    id: result.id,
                    classroomId: result.classroomId,
                    day: result.day,
                    start: result.start,
                    end: result.end
                })
            });
            res.status(StatusCodes.OK);
            res.end(JSON.stringify(schedules));
            logSuccessResponse(req, schedules);
        }
    }
}

const getById = async function (req, res) {
    const classroomId = req.params.classroomId;
    const scheduleId = req.params.scheduleId;
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
            const result = await Schedules.findOne({
                where: {
                    id: scheduleId,
                    classroomId: classroomId
                }
            });
            if (result === null) {
                const response = {
                    message: 'Schedule not found.'
                };
                res.status(StatusCodes.NOT_FOUND);
                res.end(JSON.stringify(response));
                logFailedResponse(req, response);
            } else {
                const student = {
                    id: result.id,
                    classroomId: result.classroomId,
                    day: result.day,
                    start: result.start,
                    end: result.end
                }
                res.status(StatusCodes.OK);
                res.end(JSON.stringify(student));
                logSuccessResponse(req, student);
            }
        }
    }
};

const removeSchedule = async function (req, res) {
    const email = res.locals.email;
    const classroomId = req.params.classroomId;
    const scheduleId = req.params.scheduleId;
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
            if (scheduleId === undefined || scheduleId === null || scheduleId === '') {
                const response = {
                    message: 'Schedule not found.'
                };
                res.status(StatusCodes.NOT_FOUND);
                res.end(JSON.stringify(response));
                logFailedResponse(req, response);
            } else {
                const schedule = await Schedules.findByPk(scheduleId);
                if (schedule === null) {
                    const response = {
                        message: 'Schedule not found.'
                    };
                    res.status(StatusCodes.NOT_FOUND);
                    res.end(JSON.stringify(response));
                    logFailedResponse(req, response);
                } else {
                    await Schedules.destroy({
                        where: {
                            id: scheduleId
                        }
                    });
                    const response = {
                        message: 'Schedule removed successfully.'
                    };
                    res.status(StatusCodes.NO_CONTENT);
                    res.end(JSON.stringify(response));
                    logSuccessResponse(req, response);
                }
            }
        }
    }
};

module.exports = {
    add,
    get,
    getById,
    removeSchedule
};