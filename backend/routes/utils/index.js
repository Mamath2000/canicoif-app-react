const express = require('express');
const router = express.Router();

router.use('/test-banner', require('./testBanner'));
router.use('/login', require('../login'));

module.exports = router;
