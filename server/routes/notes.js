const express = require('express');
const { getNotes, createNote, updateNote, deleteNote, togglePinNote } = require('../controllers/notesController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(protect, getNotes)
  .post(protect, admin, createNote);

router.route('/:id')
  .put(protect, admin, updateNote)
  .delete(protect, admin, deleteNote);

router.post('/:id/pin', protect, admin, togglePinNote);

router.post('/upload-pdf', protect, admin, upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ fileUrl: `/uploads/${req.file.filename}` });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

module.exports = router;
