const {Users} = require('../models');

const getNames = async function (email) {
    const user = await Users.findByPk(email);
    if (user === null) {
        return null;
    }
    return user.givenName + ' ' + user.familyName;
}

module.exports = {
    getNames
};