const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getNotifications);

router.route('/read')
  .put(markAsRead);

module.exports = router;
