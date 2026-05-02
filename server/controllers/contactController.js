const ContactMessage = require('../models/ContactMessage');
const Notification = require('../models/Notification');

// @desc    Create a new contact message
// @route   POST /api/contact
// @access  Public
const createMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message
    });

    // Notify admins
    await Notification.create({
      isGlobal: false,
      isAdminOnly: true,
      title: 'New Contact Message',
      message: `New message from ${name} (${email}): ${subject}`,
      type: 'user',
      link: '/admin/contact-messages'
    });

    res.status(201).json(contactMessage);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
const getMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
const markAsRead = async (req, res, next) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }
    message.status = 'read';
    await message.save();
    res.json(message);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteMessage = async (req, res, next) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }
    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createMessage, getMessages, markAsRead, deleteMessage };
