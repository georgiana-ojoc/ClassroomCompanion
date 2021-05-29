const router = require('express').Router();
const {oAuthCallbackController} = require('../controllers');

router.get('', oAuthCallbackController.oAuthCallback);

module.exports = router;