const config = require('config');
const {logSuccessResponse, logFailedResponse} = require('../utils/logger');
const {StatusCodes} = require('http-status-codes');

const {redirect_uri} = config.get('oauth');

const oAuth = async function (req, res) {
    const email = req.query.email;
    const scope = req.query.scope;
    if (scope === undefined || scope === null || scope === '') {
        const response = {
            message: 'Scope (URL) is required.'
        };
        res.status(StatusCodes.NOT_FOUND);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
    } else {
        const response = {
            message: 'Redirection URL generated successfully.'
        };
        res.status(StatusCodes.OK);
        const link = global.oAuth2Client.generateAuthUrl({
            prompt: 'consent',
            access_type: 'offline',
            redirect_uri: redirect_uri,
            scope: scope,
            state: email
        });
        res.end(link);
        logSuccessResponse(req, link);
    }
}

module.exports = {
    oAuth
};