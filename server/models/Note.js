const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['text', 'pdf'], default: 'text' },
  fileUrl: { type: String, default: '' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  tags: [{ type: String }],
  color: { type: String, default: '#1e1e2d' },
  isPinned: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
