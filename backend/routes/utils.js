const express = require('express');
const router = express.Router();

// GET /api/test-banner
router.get('/test-banner', (req, res) => {
  res.json({ testBanner: process.env.TEST_BANNER === 'true' });
});

module.exports = router;
