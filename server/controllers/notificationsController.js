const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const query = {
      $or: [
        { recipient: req.user._id }
      ]
    };

    if (req.user.role === 'admin') {
      query.$or.push({ isGlobal: true });
      query.$or.push({ isAdminOnly: true });
    } else {
      query.$or.push({ isGlobal: true, isAdminOnly: false });
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const { notificationIds } = req.body;
    
    // We add the user to the readBy array of the specified notifications
    if (notificationIds && notificationIds.length > 0) {
      await Notification.updateMany(
        { _id: { $in: notificationIds } },
        { $addToSet: { readBy: req.user._id } }
      );
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead };
