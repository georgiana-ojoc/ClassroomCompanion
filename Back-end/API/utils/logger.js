const bunyan = require('bunyan');
const {LoggingBunyan} = require('@google-cloud/logging-bunyan');
const loggingBunyan = new LoggingBunyan();

const logger = bunyan.createLogger({
    name: 'cc-project',
    streams: [
        {
            stream: process.stdout,
            level: 'info'
        },
        loggingBunyan.stream('info')
    ],
});

const logRequest = function (req, res, next) {
    logger.info('Request from: ' + req.header['user-agent'] + ':' + req.get('host') + ' to: ' + req.method + ' ' +
        req.url);
    next();
};

const logSuccessResponse = function (req, response) {
    logger.info('Success response (from: ' + req.headers['user-agent'] + '): ' + JSON.stringify(req.body) + '\t' +
        JSON.stringify(response));
};

const logFailedResponse = function (req, response) {
    logger.error('Failed response (from: ' + req.headers['user-agent'] + '): ' + JSON.stringify(req.body) + '\t' +
        JSON.stringify(response));
};

const logNewAccount = function (email) {
    logger.info('New account: ' + email);
}

const logNewAnnouncement = function (classroomId) {
    logger.info('New announcement: ' + classroomId);
}

module.exports = {
    logRequest,
    logSuccessResponse,
    logFailedResponse,
    logNewAccount,
    logNewAnnouncement
};