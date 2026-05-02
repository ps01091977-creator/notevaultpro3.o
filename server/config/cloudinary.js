const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    const isPdf = file.mimetype === 'application/pdf';
    return {
      folder: 'notevaultpro',
      resource_type: isVideo ? 'video' : isPdf ? 'raw' : 'image',
      allowed_formats: ['pdf', 'mp4', 'webm', 'ogg', 'jpg', 'jpeg', 'png'],
    };
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };