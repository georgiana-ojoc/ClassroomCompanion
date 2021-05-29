const config = require('config');
const express = require('express');
const passport = require('passport');
const swagger = require('./swagger.json');
const swaggerUi = require('swagger-ui-express');
const {BearerStrategy} = require('passport-azure-ad');
const {routerAPI} = require('./routes');
const {sequelize} = require('./models');
const {StatusCodes} = require('http-status-codes');
const {google} = require('googleapis');

require('dotenv').config();

const authorization = config.get('authorization');
const options = {
    identityMetadata: `https://${authorization.credentials.tenant}.b2clogin.com/${authorization.credentials.tenant}` +
        `.onmicrosoft.com/${authorization.policies.policyName}/${authorization.metadata.version}` +
        `/${authorization.metadata.discovery}`,
    clientID: authorization.credentials.clientID,
    audience: authorization.credentials.clientID,
    policyName: authorization.policies.policyName,
    isB2C: authorization.settings.isB2C,
    validateIssuer: authorization.settings.validateIssuer,
    passReqToCallback: authorization.settings.passReqToCallback
};
const bearerStrategy = new BearerStrategy(options, (token, done) => {
        done(null, {}, token);
    }
);
const {client_id, client_secret, redirect_uri} = config.get('oauth');
global.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

const app = express();

let port = process.env.PORT;
if (port === undefined || port === null || port === "") {
    port = 8000;
}

function errorHandler(error, request, response, _) {
    const body = {

        message: 'Request body is not valid.'
    };
    response.status(StatusCodes.BAD_REQUEST);
    response.end(JSON.stringify(body));
}

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(errorHandler);

app.use(passport.initialize());
passport.use(bearerStrategy);

sequelize.sync().then();

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (!req.url.includes('swagger')) {
        res.header('Content-Type', 'application/json');
    }
    next();
});

app.use('', routerAPI);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swagger));

app.listen(port, () => {
    console.log(`listening on port ${port}...`);
});