const {createTransport} = require("nodemailer");
const {google} = require("googleapis");

const OAuth2 = google.auth.OAuth2;

const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(process.env.NAME, process.env.USER, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    logging: false
});

const Classrooms = sequelize.define('classrooms', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: 'name_subject_professor'
    },
    subject: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: 'name_subject_professor'
    },
    professor: {
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: 'name_subject_professor',
        validate: {
            isEmail: true
        }
    }
}, {
    timestamps: false,
    unique: {
        name_subject_professor: {
            fields: ['name', 'subject', 'professor']
        }
    }
});

const Students = sequelize.define('students', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    classroomId: {
        field: 'classroom_id',
        type: Sequelize.UUID,
        allowNull: false,
        unique: 'classroom_id_email'
    },
    email: {
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: 'classroom_id_email',
        validate: {
            isEmail: true
        }
    }
}, {
    timestamps: false,
    unique: {
        classroom_id_email: {
            fields: ['classroom_id', 'email']
        }
    }
});

Classrooms.hasMany(Students, {
    foreignKey: 'classroom_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Students.belongsTo(Classrooms, {
    foreignKey: 'classroom_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});

sequelize.sync().then();

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

        const transporter = createTransport({
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
        return transporter;
    } catch (error) {
        console.log(error);
    }
};

const sendEmail = async function (emailOptions) {
    const emailTransporter = await createTransporter();
    await emailTransporter.sendMail(emailOptions);
};

exports.sendNewAnnouncementEmailToStudents = async function (event, _) {
    const message = event.data
        ? Buffer.from(event.data, 'base64').toString()
        : 'error';
    if (message !== 'error') {
        console.log(message);
        const content = JSON.parse(message);
        console.log(content);
        let classroomId = JSON.stringify(content.jsonPayload);
        classroomId = classroomId.split(' ')[2];
        const classroom = await Classrooms.findByPk(classroomId);
        if (classroom !== null) {
            const students = await Students.findAll({
                where: {
                    classroomId: classroom.id
                }
            });
            for (const student of students) {
                sendEmail({
                    subject: `${classroom.name} ${classroom.subject} - new announcement (Classroom Companion)`,
                    text: `A new announcement was posted on ${classroom.name} ${classroom.subject}.`,
                    to: student.email,
                    from: process.env.EMAIL
                });
            }
        }
    }
}