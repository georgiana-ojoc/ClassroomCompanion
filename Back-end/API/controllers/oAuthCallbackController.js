const {logSuccessResponse, logFailedResponse} = require('../utils/logger');
const {StatusCodes} = require('http-status-codes');
const {Tokens} = require('../models');
const config = require('config');

const scope = config.get('calendar').scope;

const oAuthCallback = async function (req, res) {
    const email = req.query.state;
    const code = req.query.code;
    const callback = req.query.callback;
    if (email === undefined || email === null || email === "" || code === undefined || code === null || code === "") {
        const response = {
            message: 'State (email) and code (string) are required.'
        };
        res.status(StatusCodes.BAD_REQUEST);
        res.location(`/oauth?scope=${scope}`);
        res.end(JSON.stringify(response));
        logFailedResponse(req, response);
    } else {
        const {tokens} = await global.oAuth2Client.getToken(code);
        if (tokens.refresh_token === undefined) {
            const response = {
                message: 'Authorize the scope.'
            };
            res.status(StatusCodes.BAD_REQUEST);
            res.location(`/oauth?scope=${scope}`);
            res.end(JSON.stringify(response));
            logFailedResponse(req, response);
        } else {
            await Tokens.create({
                email: email,
                tokens: JSON.stringify(tokens)
            });
           res.redirect(`${callback}?authorization=true`);
        }
    }
}

module.exports = {
    oAuthCallback
};