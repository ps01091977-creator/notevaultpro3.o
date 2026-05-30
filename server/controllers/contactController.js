const ContactMessage = require('../models/ContactMessage');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a new contact message
// @route   POST /api/contact
// @access  Public
const createMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate fields
    if (!name || !name.trim() || !email || !email.trim() || !subject || !subject.trim() || !message || !message.trim()) {
      res.status(400);
      throw new Error('All fields (name, email, subject, message) are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }
    
    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim()
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

    // Send email to admin
    try {
      const recipientEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      if (recipientEmail) {
        await sendEmail({
          email: recipientEmail, // The admin email (receives the message)
          subject: `NoteVault Pro - New Contact Message: ${subject}`,
          message: `You have received a new message from the contact form.\n\nFrom: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fcfcfc;">
              <h2 style="color: #6366f1; text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">New Contact Form Submission</h2>
              <p>Hello Admin,</p>
              <p>You have received a new contact message from <strong>NoteVault Pro</strong>.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Sender Name:</strong> ${name}</p>
                <p style="margin: 5px 0;"><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #6366f1;">${email}</a></p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
              </div>
              <div style="background-color: #ffffff; padding: 15px; border: 1px dashed #d1d5db; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #4b5563;">Message Details:</p>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap; color: #1f2937;">${message}</p>
              </div>
              <p style="font-size: 0.9em; color: #9ca3af; text-align: center; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
                This email was generated automatically by NoteVault Pro contact form.
              </p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error('Error sending contact message email to admin:', emailError);
    }

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
