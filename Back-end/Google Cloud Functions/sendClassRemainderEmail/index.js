const {createTransport} = require("nodemailer");
const {google} = require("googleapis");
const moment = require('moment-timezone');

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

const Schedules = sequelize.define('schedules', {
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
        unique: 'classroom_id_day_start_end'
    },
    day: {
        type: Sequelize.STRING(16),
        allowNull: false,
        unique: 'classroom_id_day_start_end',
        validate: {
            isIn: {
                args: [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']],
                msg: 'Day must be Monday, Tuesday, Wednesday, Thursday, Friday, Saturday or Sunday.'
            }
        }
    },
    start: {
        type: Sequelize.STRING(8),
        allowNull: false,
        unique: 'classroom_id_day_start_end',
        validate: {
            isBeforeEnd(value) {
                if (value > this.end) {
                    throw new Error('Start must be before end.');
                }
            }
        }
    },
    end: {
        type: Sequelize.STRING(8),
        allowNull: false,
        unique: 'classroom_id_day_start_end'
    }
}, {
    timestamps: false,
    unique: {
        classroom_id_day_start_end: {
            fields: ['classroom_id', 'day', 'start', 'end']
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

Classrooms.hasMany(Schedules, {
    foreignKey: 'classroom_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});

Schedules.belongsTo(Classrooms, {
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

exports.sendClassRemainderEmail = async function (event, _) {
    const time = moment().tz("Europe/Bucharest").add(15, 'minutes');
    const day = time.format('dddd');
    const hour = time.format('HH');
    const minute = time.format('mm');
    const start = `${hour}:${minute}`;

    const classrooms = await Classrooms.findAll();
    for (const classroom of classrooms) {
        const name = classroom.name;
        const subject = classroom.subject;
        const students = await Students.findAll({
            where: {
                classroomId: classroom.id
            }
        });
        const schedules = await Schedules.findAll({
            where: {
                classroomId: classroom.id
            }
        });
        for (const schedule of schedules) {
            if (schedule.day === day && schedule.start === start) {
                sendEmail({
                    subject: `${name} ${subject} remainder (Classroom Companion)`,
                    text: `${name} ${subject} starts in 15 minutes (at ${schedule.start}).`,
                    to: classroom.professor,
                    from: process.env.EMAIL
                });
                for (const student of students) {
                    sendEmail({
                        subject: `${name} ${subject} remainder (Classroom Companion)`,
                        text: `${name} ${subject} starts in 15 minutes (at ${schedule.start}).`,
                        to: student.email,
                        from: process.env.EMAIL
                    });
                }
            }
        }
    }
}