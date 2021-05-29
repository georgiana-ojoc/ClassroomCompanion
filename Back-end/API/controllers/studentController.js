const {Classrooms, Students} = require('../models');
const {getNames} = require('../utils/user');
const {logSuccessResponse, logFailedResponse} = require('../utils/logger');
const {StatusCodes} = require('http-status-codes');

const join = async function (req, res) {
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
        } else if (classroom.professor === email) {
            const response = {
                message: 'User already professor of the specified classroom.'
            };
            res.status(StatusCodes.CONFLICT);
            res.end(JSON.stringify(response));
            logFailedResponse(req, response);
        } else {
            let [student, created] = await Students.findOrCreate({
                where: {
                    classroomId: id,
                    email: email
                },
                defaults: {
                    classroomId: id,
                    email: email
                }
            });
            if (!created) {
                const response = {
                    message: 'User already student of the specified classroom.'
                };
                res.status(StatusCodes.CONFLICT);
                res.end(JSON.stringify(response));
                logFailedResponse(req, response);
            } else {
                student = student.toJSON();
                student.names = await getNames(student.email);
                res.status(StatusCodes.CREATED);
                res.end(JSON.stringify(student));
                logSuccessResponse(req, student);
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
            const results = await Students.findAll({
                where: {
                    classroomId: id
                }
            });
            let students = [];
            for (let result of results) {
                students.push({
                    id: result.id,
                    classroomId: result.classroomId,
                    email: result.email,
                    names: await getNames(result.email)
                })
            }
            res.status(StatusCodes.OK);
            res.end(JSON.stringify(students));
            logSuccessResponse(req, students);
        }
    }
};

const leave = async function (req, res) {
    const email = res.locals.email;
    const classroomId = req.params.classroomId;
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
            const student = await Students.findOne({
                where: {
                    classroomId: classroomId,
                    email: email
                }
            });
            if (student === null) {
                const response = {
                    message: 'User not student of the specified classroom.'
                };
                res.status(StatusCodes.NOT_FOUND);
                res.end(JSON.stringify(response));
                logFailedResponse(req, response);
            } else {
                await Students.destroy({
                    where: {
                        classroomId: classroomId,
                        email: email
                    }
                });
                const response = {
                    message: 'Student removed successfully.'
                };
                res.status(StatusCodes.NO_CONTENT);
                res.end(JSON.stringify(response));
                logSuccessResponse(req, response);
            }
        }
    }
}

module.exports = {
    join,
    get,
    leave
};