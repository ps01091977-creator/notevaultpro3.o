const Video = require('../models/Video');

// @desc    Get all videos
// @route   GET /api/videos
// @access  Private
const getVideos = async (req, res, next) => {
  try {
    const { subject, search } = req.query;
    let query = {};

    if (subject) query.subject = subject;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const videos = await Video.find(query).populate('subject', 'name color').sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a video
// @route   POST /api/videos
// @access  Private
const createVideo = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      fileUrl,
      youtubeUrl,
      videoUrl,
      thumbnail,
      duration,
      subject,
      playlist
    } = req.body;

    const videoData = {
      title,
      description,
      thumbnail,
      duration,
      subject,
      playlist,
      owner: req.user._id
    };

    // Accept both the older `videoUrl` field and explicit fields.
    if (fileUrl) videoData.fileUrl = fileUrl;
    if (youtubeUrl) videoData.youtubeUrl = youtubeUrl;

    if (videoUrl) {
      if (type === 'upload' || (!type && !videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be'))) {
        videoData.fileUrl = videoUrl;
      } else {
        videoData.youtubeUrl = videoUrl;
      }
    }

    videoData.type = type || (videoData.youtubeUrl ? 'url' : 'upload');

    const video = await Video.create(videoData);
    res.status(201).json(video);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a video
// @route   PUT /api/videos/:id
// @access  Private
const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    if (video.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedVideo);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private
const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    if (video.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await video.deleteOne();
    res.json({ message: 'Video removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update watch progress
// @route   PUT /api/videos/:id/progress
// @access  Private
const updateProgress = async (req, res, next) => {
  try {
    const { watchProgress } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }

    video.watchProgress = watchProgress;
    await video.save();

    res.json({ watchProgress: video.watchProgress });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVideos, createVideo, updateVideo, deleteVideo, updateProgress };
