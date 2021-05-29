const {Users} = require('../models');
const passport = require('passport');
const {isEmpty} = require('lodash');
const {logNewAccount} = require('./logger');
const {StatusCodes} = require('http-status-codes');
const {validationResult} = require('express-validator');

const checkToken = function (req, res, next) {
    passport.authenticate('oauth-bearer', {
        failureRedirect: '/unauthorized',
        session: false
    })(req, res, next);
};

const getEmail = function (req, res, next) {
    const payload = req.authInfo;
    const email = payload.emails[0];

    Users.findOrCreate({
        where: {
            email: email
        },
        defaults: {
            email: email,
            givenName: payload.given_name,
            familyName: payload.family_name
        }
    }).then(([, created]) => {
        if (created) {
            logNewAccount(email);
        }

        res.locals.email = email;
        next();
    });
};

const checkQuery = function (req, res, next) {
    console.log(req.query);
    if (isEmpty(req.query)) {
        const response = {
            message: 'Query can not be empty.'
        };
        res.status(StatusCodes.UNPROCESSABLE_ENTITY);
        res.end(JSON.stringify(response));
    } else {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorsArray = errors.array();
            const response = {
                message: errorsArray[0]['msg']
            };
            res.status(StatusCodes.BAD_REQUEST);
            res.end(JSON.stringify(response));
        } else {
            next();
        }
    }
}

const checkJSONContentTypeHeader = function (req, res, next) {
    if (!req.is('application/json')) {
        const response = {

            message: 'Content-Type not set to application/json.'
        };
        res.status(StatusCodes.UNSUPPORTED_MEDIA_TYPE);
        res.end(JSON.stringify(response));
    } else {
        next();
    }
}

const checkBody = function (req, res, next) {
    console.log(req.body);
    if (isEmpty(req.body)) {
        const response = {

            message: 'Body can not be empty.'
        };
        res.status(StatusCodes.UNPROCESSABLE_ENTITY);
        res.end(JSON.stringify(response));
    } else {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorsArray = errors.array();
            const response = {

                message: errorsArray[0]['msg']
            };
            res.status(StatusCodes.BAD_REQUEST);
            res.end(JSON.stringify(response));
        } else {
            next();
        }
    }
}

module.exports = {
    checkToken,
    getEmail,
    checkQuery,
    checkJSONContentTypeHeader,
    checkBody
};