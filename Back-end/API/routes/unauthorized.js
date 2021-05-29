const router = require('express').Router();
const {StatusCodes} = require('http-status-codes');

router.get('', async function (req, res) {
    const response = {

        message: 'Authorization not valid.'
    };
    res.status(StatusCodes.UNAUTHORIZED);
    res.end(JSON.stringify(response));
});

module.exports = router;