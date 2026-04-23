const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  color: { type: String, default: '#7c3aed' },
  emoji: { type: String, default: '📚' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
