const express = require('express');
const { getNotes, createNote, updateNote, deleteNote, togglePinNote } = require('../controllers/notesController');
const { protect, admin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.route('/')
  .get(getNotes)
  .post(protect, admin, createNote);

router.route('/:id')
  .put(protect, admin, updateNote)
  .delete(protect, admin, deleteNote);

router.post('/:id/pin', protect, admin, togglePinNote);

router.post('/upload-pdf', protect, admin, upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ fileUrl: req.file.path });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

module.exports = router;