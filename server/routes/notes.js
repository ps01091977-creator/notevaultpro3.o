const express = require('express');
const { getNotes, createNote, updateNote, deleteNote, togglePinNote } = require('../controllers/notesController');
const { protect, admin } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

const router = express.Router();

router.route('/')
  .get(getNotes)
  .post(protect, admin, createNote);

router.route('/:id')
  .put(protect, admin, updateNote)
  .delete(protect, admin, deleteNote);

router.post('/:id/pin', protect, admin, togglePinNote);

router.post('/upload-pdf', protect, admin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    res.json({ fileUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;