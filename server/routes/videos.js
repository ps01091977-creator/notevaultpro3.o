const express = require('express');
const { getVideos, createVideo, updateVideo, deleteVideo, updateProgress } = require('../controllers/videosController');
const { protect, admin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.route('/')
  .get(getVideos)
  .post(protect, admin, createVideo);

router.route('/:id')
  .put(protect, admin, updateVideo)
  .delete(protect, admin, deleteVideo);

router.put('/:id/progress', protect, updateProgress);

router.post('/upload', protect, admin, upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ fileUrl: req.file.path });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

module.exports = router;