const express = require('express');
const router = express.Router();


// Nouvelle route pour /api/internal-check
router.get('/', (req, res) => {
  res.json({ sessionValid: true });
});

module.exports = router;
