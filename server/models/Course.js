const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  durationYears: { type: Number, required: true },
  maxSemesters: { type: Number, required: true },
  branches: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
