const express = require('express');
const { getOverview, getWeeklyActivity, getGlobalStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', protect, getOverview);
router.get('/weekly', protect, getWeeklyActivity);
router.get('/global', getGlobalStats);

module.exports = router;
