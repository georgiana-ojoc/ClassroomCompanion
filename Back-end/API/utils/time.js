const moment = require('moment-timezone');

const getNow = function () {
    return moment().tz('Europe/Bucharest').format("DD.MM.YYYY HH:mm");
}

const getTime = function(time) {
    const date = new Date(time);
    let result = '';
    const hours = date.getHours();
    if (hours < 10) {
        result = '0' + hours;
    } else {
        result = hours;
    }
    result += ':';
    const minutes = date.getMinutes();
    if (minutes < 10) {
        result += '0' + minutes;
    } else {
        result += minutes;
    }
    return result;
}

module.exports = {
    getNow,
    getTime
};