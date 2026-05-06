const express = require('express');
const { getVideos, createVideo, updateVideo, deleteVideo, updateProgress } = require('../controllers/videosController');
const { protect, admin } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

const router = express.Router();

router.route('/')
  .get(getVideos)
  .post(protect, admin, createVideo);

router.route('/:id')
  .put(protect, admin, updateVideo)
  .delete(protect, admin, deleteVideo);

router.put('/:id/progress', protect, updateProgress);

router.post('/upload', protect, admin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype, req.file.originalname);
    res.json({ fileUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;