const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['upload', 'url'], default: 'url' },
  fileUrl: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  duration: { type: Number, default: 0 }, // in seconds
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  playlist: { type: String, default: '' },
  watchProgress: { type: Number, default: 0 }, // in seconds
  bookmarks: [{
    time: Number,
    label: String
  }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
