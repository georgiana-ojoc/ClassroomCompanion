const routerAPI = require('express').Router();

const unauthorized = require('./unauthorized');
const classroom = require('./classroom');
const student = require('./student');
const schedule = require('./schedule');
const oauth = require('./oAuth');
const oAuthCallback = require('./oAuthCallback');
const calendar = require('./calendar');
const announcement = require('./announcement');

routerAPI.use('/unauthorized', unauthorized);
routerAPI.use('/classrooms', classroom);
routerAPI.use('/classrooms', student);
routerAPI.use('/classrooms', schedule);
routerAPI.use('/oauth', oauth);
routerAPI.use('/oauth-callback', oAuthCallback);
routerAPI.use('/calendar', calendar);
routerAPI.use('/classrooms', announcement);

module.exports = {
    routerAPI
};