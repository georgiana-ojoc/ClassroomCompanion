const {Classrooms, Students} = require('../models');
const {getNames} = require('../utils/user');
const {logSuccessResponse, logFailedResponse} = require('../utils/logger');
const {StatusCodes} = require('http-status-codes');

const create = async function (req, res) {
    const professor = res.locals.email;
    const name = req.body.name;
    const subject = req.body.subject;
    let [classroom, created] = await Classrooms.findOrCreate({
        where: {
            name: name,
            subject: subject,
            professor: professor
        },
        defaults: {
            name: name,
            subject: subject,
            professor: professor
        }
    });
    if (!created) {
        const response = {
            message: 'Classroom with specified name, subject and professor already exists.'
        };
        res.status(StatusCodes.CONFLICT);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
    } else {
        classroom = classroom.toJSON();
        classroom.names = await getNames(classroom.professor);
        res.status(StatusCodes.CREATED);
        res.end(JSON.stringify(classroom));
        logSuccessResponse(req, classroom);
    }
};

const get = async function (req, res) {
    const email = res.locals.email;
    const role = req.query.role;
    if (role === 'professor') {
        const classrooms = await Classrooms.findAll({
            where: {
                professor: email
            }
        });
        let results = [];
        for (let classroom of classrooms) {
            results.push({
                ...classroom.dataValues,
                names: await getNames(classroom.professor)
            });
        }
        res.status(StatusCodes.OK);
        res.end(JSON.stringify(results));
        logSuccessResponse(req, results);
    } else {
        const results = await Students.findAll({
            where: {
                email: email
            },
            include: Classrooms
        });
        let classrooms = [];
        for (let result of results) {
            classrooms.push({
                ...result.classroom.dataValues,
                names: await getNames(result.classroom.professor)
            });
        }
        res.status(StatusCodes.OK);
        res.end(JSON.stringify(classrooms));
        logSuccessResponse(req, classrooms);
    }
}

const getById = async function (req, res) {
    const id = req.params.classroomId;
    if (id === undefined || id === null || id === '') {
        const response = {
            message: 'Classroom not found.'
        };
        res.status(StatusCodes.NOT_FOUND);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
    } else {
        let classroom = await Classrooms.findByPk(id);
        if (classroom === null) {
            const response = {
                message: 'Classroom not found.'
            };
            res.status(StatusCodes.NOT_FOUND);
            res.end(JSON.stringify(response));
            logFailedResponse(req, response);
        } else {
            classroom = classroom.toJSON();
            classroom.names = await getNames(classroom.professor);
            res.status(StatusCodes.OK);
            res.end(JSON.stringify(classroom));
            logSuccessResponse(req, classroom);
        }
    }
};

const deleteClassroom = async function (req, res) {
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
            await Classrooms.destroy({
                where: {
                    id: id
                }
            });
            const response = {
                message: 'Classroom deleted successfully.'
            };
            res.status(StatusCodes.NO_CONTENT);
            res.end(JSON.stringify(response));
            logSuccessResponse(req, response);
        }
    }
};

module.exports = {
    create,
    get,
    getById,
    deleteClassroom
};