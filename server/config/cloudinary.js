const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for Cloudinary Free Tier
});

const uploadToCloudinary = (buffer, mimetype, originalname) => {
  return new Promise((resolve, reject) => {
    // Determine public_id (remove extension to let cloudinary handle it or keep it)
    const nameWithoutExt = originalname ? originalname.split('.').slice(0, -1).join('.') : 'document';
    
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: 'notevaultpro', 
        resource_type: 'auto',
        public_id: nameWithoutExt,
        format: mimetype === 'application/pdf' ? 'pdf' : undefined
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

module.exports = { cloudinary, upload, uploadToCloudinary };