const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

function checkFileType(file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();
  const isPdf = ext === '.pdf' && mime === 'application/pdf';
  const isImage = ['.jpg', '.jpeg', '.png'].includes(ext) && ['image/jpeg', 'image/png'].includes(mime);
  // Keep video uploads browser-compatible so they are playable in HTML5 video.
  const isVideo = ['.mp4', '.webm', '.ogg'].includes(ext) && ['video/mp4', 'video/webm', 'video/ogg'].includes(mime);

  if (isPdf || isImage || isVideo) {
    return cb(null, true);
  } else {
    cb('Error: Supported files are PDF, JPG/PNG, and video formats MP4/WebM/OGG.');
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 100000000 }, // 100MB limit for videos
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
