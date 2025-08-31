const express = require('express');
const router = express.Router();
const { authenticateView } = require('../middleware/auth');
const {birdsEyeSummary} = require("../controllers/stockController");

// GET /api/assets/birdseye-summary
router.get('/', authenticateView, birdsEyeSummary);

module.exports = router;