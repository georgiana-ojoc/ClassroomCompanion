const router = require('express').Router();
const {oAuthController} = require('../controllers');

router.get('', oAuthController.oAuth);

module.exports = router;