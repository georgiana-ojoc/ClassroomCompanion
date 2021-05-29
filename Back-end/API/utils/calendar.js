const {google} = require('googleapis');
const {getTime} = require('./time');
const {logFailedResponse} = require('../utils/logger');
const moment = require('moment-timezone');
const {StatusCodes} = require('http-status-codes');

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekDayNumbers = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
};

function getNextWeek(today) {
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
}

function getDate(day, hours, minutes) {
    let date = moment().tz('Europe/Bucharest').toDate();
    let today = date.getDay();
    date.setDate(date.getDate() + day - today);
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
}

createEvent = async function (req, res, authorization, title, day, start, end) {
    const startDay = weekDayNumbers[day];
    let startHours, startMinutes;
    [startHours, startMinutes] = start.split(':');
    const startDate = getDate(startDay, startHours, startMinutes);

    let endDay = startDay;
    let endHours, endMinutes;
    [endHours, endMinutes] = end.split(':');
    if (endHours < startHours || (startHours === endHours && endMinutes < startMinutes))
        endDay = (endDay + 1) % 7;
    const endDate = getDate(endDay, endHours, endMinutes);

    const event = {
        summary: 'Classroom Companion event',
        location: 'online',
        description: title,
        start: {
            dateTime: startDate.toISOString(),
            timeZone: 'Europe/Bucharest'
        },
        end: {
            dateTime: endDate.toISOString(),
            timeZone: 'Europe/Bucharest'
        },
        recurrence: [
            'RRULE:FREQ=WEEKLY;UNTIL=20210725'
        ],
        reminders: {
            useDefault: false,
            overrides: [
                {
                    method: 'popup',
                    minutes: 15
                }
            ]
        }
    };

    try {
        const calendar = google.calendar({
            version: 'v3',
            auth: authorization
        });
        const result = await calendar.events.insert({
            auth: authorization,
            calendarId: 'primary',
            resource: event
        });
        return {
            id: result.data.id,
            link: result.data.htmlLink
        };
    } catch (error) {
        const response = {
            message: error.message
        };
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
        return null;
    }
}

getEvents = async function (req, res, authorization) {
    try {
        const calendar = google.calendar({
            version: 'v3',
            auth: authorization
        });
        const today = new Date();
        const result = await calendar.events.list({
            calendarId: 'primary',
            timeMin: today.toISOString(),
            timeMax: getNextWeek(today),
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime'
        });
        const events = result.data.items;
        const eventsList = [];
        if (events.length) {
            for (let event of events) {
                if (event.description !== undefined && event.description === description) {
                    eventsList.push(getEventObject(event, true));
                }
            }
        }
        return eventsList;
    } catch (error) {
        const response = {
            message: error.message
        };
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
        return null;
    }
}

getEvent = async function (req, res, authorization, id) {
    try {
        const calendar = google.calendar({
            version: 'v3',
            auth: authorization
        });
        const result = await calendar.events.get({
            auth: authorization,
            calendarId: 'primary',
            eventId: id
        });
        return getEventObject(result.data, false);
    } catch (error) {
        const response = {
            message: error.message
        };
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
        return null;
    }
}

getEventObject = function (event, all = true) {
    const day = weekDays[new Date(event.start.dateTime).getDay() - 1];
    const start = getTime(event.start.dateTime);
    const end = getTime(event.end.dateTime);
    const summary = event.summary;
    let id;
    if (all) {
        id = event.recurringEventId;
    } else {
        id = event.id;
    }
    return {
        id: id,
        link: event.htmlLink,
        title: summary,
        day: day,
        start: start,
        end: end
    };
}

deleteEvent = async function (req, res, authorization, id) {
    try {
        const calendar = google.calendar({
            version: 'v3',
            auth: authorization
        });
        const result = await calendar.events.delete({
            auth: authorization,
            calendarId: 'primary',
            eventId: id
        });
        return result.data;
    } catch (error) {
        const response = {
            message: error.message
        };
        res.status(StatusCodes.INTERNAL_SERVER_ERROR);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
        return null;
    }
}

module.exports = {
    getEvents,
    createEvent,
    getEvent,
    deleteEvent
}