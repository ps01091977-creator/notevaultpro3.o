const express = require('express');
const router = express.Router();
const { createMessage, getMessages, markAsRead, deleteMessage } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(createMessage)
  .get(protect, admin, getMessages);

router.route('/:id/read')
  .put(protect, admin, markAsRead);

router.route('/:id')
  .delete(protect, admin, deleteMessage);

module.exports = router;
