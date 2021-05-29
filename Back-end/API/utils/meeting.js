const {google} = require('googleapis');
const {logFailedResponse} = require('../utils/logger');
const {StatusCodes} = require('http-status-codes');
const moment = require('moment-timezone');

function getDate(date, time) {
    let splittedDay = date.split('.');
    let splittedTime = time.split(':');
    let result = moment().tz('Europe/Bucharest');
    result.set({
        date: splittedDay[0],
        month: splittedDay[1] - 1,
        year: splittedDay[2],
        hour: splittedTime[0],
        minute: splittedTime[1]
    });
    return result.toDate();
}

createMeeting = async function (req, res, authorization, description, date, start, end) {
    const startDate = getDate(date, start);
    const endDate = getDate(date, end);

    const event = {
        summary: 'Classroom Companion meeting',
        location: 'online',
        description: description,
        conferenceData: {
            createRequest: {
                requestId: "zzz",
                conferenceSolutionKey: {
                    type: 'hangoutsMeet'
                }
            }
        },
        start: {
            dateTime: startDate.toISOString(),
            timeZone: 'Europe/Bucharest'
        },
        end: {
            dateTime: endDate.toISOString(),
            timeZone: 'Europe/Bucharest'
        },
        reminders: {
            useDefault: false,
            overrides: [
                {
                    method: 'popup',
                    minutes: 15
                }
            ]
        }
    }

    try {
        const calendar = google.calendar({
            version: 'v3',
            auth: authorization
        });
        const result = await calendar.events.insert({
            auth: authorization,
            calendarId: 'primary',
            conferenceDataVersion: '1',
            resource: event
        });
        return {
            id: result.data.id,
            link: result.data.hangoutLink
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

module.exports = {
    createMeeting
}