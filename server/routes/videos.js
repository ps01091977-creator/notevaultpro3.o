const express = require('express');
const { getVideos, createVideo, updateVideo, deleteVideo, updateProgress } = require('../controllers/videosController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(protect, getVideos)
  .post(protect, admin, createVideo);

router.route('/:id')
  .put(protect, admin, updateVideo)
  .delete(protect, admin, deleteVideo);

router.put('/:id/progress', protect, updateProgress); // Regular users can update progress

router.post('/upload', protect, admin, upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ fileUrl: `/uploads/${req.file.filename}` });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

module.exports = router;
