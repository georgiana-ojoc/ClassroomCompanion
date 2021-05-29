const {createTransport} = require("nodemailer");
const {google} = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const createTransporter = async function () {
    try {
        const oAuth2Client = new OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );

        oAuth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });

        const accessToken = await new Promise((resolve, reject) => {
            oAuth2Client.getAccessToken((error, token) => {
                if (error) {
                    console.log(error);
                    reject("Failed to create access token: ");
                }
                resolve(token);
            });
        });

        return createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.EMAIL,
                accessToken,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                tls: {
                    rejectUnauthorized: false
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
};

const sendEmail = async function (emailOptions) {
    const emailTransporter = await createTransporter();
    await emailTransporter.sendMail(emailOptions);
};

exports.sendWelcomeEmailToNewAccount = function (event, _) {
    const message = event.data
        ? Buffer.from(event.data, 'base64').toString()
        : 'error';
    if (message !== 'error') {
        const content = JSON.parse(message);
        let email = JSON.stringify(content.jsonPayload);
        email = email.split(' ')[2];
        sendEmail({
            subject: 'Welcome to Classroom Companion',
            text: 'Welcome to our application. We are glad to have you here.',
            to: email,
            from: process.env.EMAIL
        });
    }
};