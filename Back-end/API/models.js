require('dotenv').config();

const config = require('config');
const {Sequelize} = require('sequelize');

const database = config.get('database');

const sequelize = new Sequelize(database.name, database.user, process.env.PASSWORD, {
    host: database.host,
    dialect: database.dialect,
    logging: false
});

const Users = sequelize.define('users', {
    email: {
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: true,
        primaryKey: true,
        validate: {
            isEmail: true
        }
    },
    givenName: {
        field: 'given_name',
        type: Sequelize.STRING(128),
        allowNull: false
    },
    familyName: {
        field: 'family_name',
        type: Sequelize.STRING(128),
        allowNull: false
    }
}, {
    timestamps: false
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

const Announcements = sequelize.define('announcements', {
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
    },
    description: {
        type: Sequelize.STRING(2048),
        allowNull: false
    },
    severity: {
        type: Sequelize.STRING(16),
        allowNull: false,
        validate: {
            isIn: {
                args: [['important', 'informative']],
                msg: 'Severity must be important or informative.'
            }
        }
    },
    meetingId: {
        field: 'meeting_id',
        type: Sequelize.STRING(128),
        allowNull: true
    },
    meetingLink: {
        field: 'meeting_link',
        type: Sequelize.STRING(256),
        allowNull: true
    },
    meetingDate: {
        field: 'meeting_date',
        type: Sequelize.STRING(16),
        allowNull: true
    },
    meetingStart: {
        field: 'meeting_start',
        type: Sequelize.STRING(8),
        allowNull: true,
        validate: {
            isBeforeEnd(value) {
                if (value > this.meetingEnd) {
                    throw new Error('Meeting start must be before meeting end.');
                }
            }
        }
    },
    meetingEnd: {
        field: 'meeting_end',
        type: Sequelize.STRING(8),
        allowNull: true
    },
    created: {
        type: Sequelize.STRING(64),
        allowNull: true
    }
}, {
    timestamps: false
});

const Tokens = sequelize.define('tokens', {
    email: {
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: true,
        primaryKey: true,
        validate: {
            isEmail: true
        }
    },
    tokens: {
        type: Sequelize.STRING(512),
        allowNull: false
    }
}, {
    timestamps: false
});

Users.hasMany(Classrooms, {
    foreignKey: 'professor',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Classrooms.belongsTo(Users, {
    foreignKey: 'professor',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});

Users.hasMany(Students, {
    foreignKey: 'email',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Students.belongsTo(Users, {
    foreignKey: 'email',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
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

Classrooms.hasMany(Announcements, {
    foreignKey: 'classroom_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
})

Announcements.belongsTo(Classrooms, {
    foreignKey: 'classroom_id',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});

Users.hasOne(Tokens, {
    foreignKey: 'email',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});
Tokens.belongsTo(Users, {
    foreignKey: 'email',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
});

module.exports = {
    sequelize,
    Users,
    Classrooms,
    Students,
    Schedules,
    Announcements,
    Tokens
}