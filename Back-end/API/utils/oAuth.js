const {logFailedResponse} = require('../utils/logger');
const {StatusCodes} = require('http-status-codes');
const {Tokens} = require('../models');

const getTokens = async function (email) {
    const tokens = await Tokens.findByPk(email);
    if (tokens === null) {
        return null;
    }
    return JSON.parse(tokens.tokens);
}

const runCallback = async function (req, res, email, scope, callback, ...parameters) {
    const tokens = await getTokens(email);
    if (tokens === null) {
        const response = {
            message: 'Authorize scope.'
        };
        res.status(StatusCodes.UNAUTHORIZED);
        res.location("/oauth?scope=" + scope);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
        return null;
    } else {
        global.oAuth2Client.setCredentials(tokens);
        return await callback(req, res, ...parameters);
    }
}

module.exports = {
    runCallback
};