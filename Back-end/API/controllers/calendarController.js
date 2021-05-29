const calendar = require('../utils/calendar');
const config = require('config');
const {logSuccessResponse} = require('../utils/logger');
const {StatusCodes} = require('http-status-codes');
const {runCallback} = require('../utils/oAuth');

const scope = config.get('calendar').scope;

const createEvent = async function (req, res) {
    const email = res.locals.email;
    const title = req.body.title;
    const day = req.body.day;
    const start = req.body.start;
    const end = req.body.end;
    const event = await runCallback(req, res, email, scope, calendar.createEvent, global.oAuth2Client,
        title, day, start, end);
    if (event !== null) {
        res.status(StatusCodes.CREATED);
        res.end(JSON.stringify(event));
        logSuccessResponse(req, event);
    }
}

const getEvents = async function (req, res) {
    const email = res.locals.email;
    const events = await runCallback(req, res, email, scope, calendar.getEvents, global.oAuth2Client);
    if (events !== null) {
        res.status(StatusCodes.OK);
        res.end(JSON.stringify(events));
        logSuccessResponse(req, events);
    }
}

const getEvent = async function (req, res) {
    const email = res.locals.email;
    const id = req.params.eventId;
    const event = await runCallback(req, res, email, scope, calendar.getEvent, global.oAuth2Client, id);
    if (event !== null) {
        res.status(StatusCodes.OK);
        res.end(JSON.stringify(event));
        logSuccessResponse(req, event);
    }
}

const deleteEvent = async function (req, res) {
    const email = res.locals.email;
    const id = req.params.eventId;
    const event = await runCallback(req, res, email, scope, calendar.deleteEvent, global.oAuth2Client,
        id);
    if (event !== null) {
        const response = {
            message: 'Event deleted successfully.'
        };
        res.status(StatusCodes.NO_CONTENT);
        res.end(JSON.stringify(response));
        logSuccessResponse(req, response);
    }
}

module.exports = {
    createEvent,
    getEvents,
    getEvent,
    deleteEvent
};