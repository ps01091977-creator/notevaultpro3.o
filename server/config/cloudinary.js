const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fs = require('fs');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit for local fallback / Cloudinary
});

const saveLocally = (buffer, originalname) => {
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const ext = originalname ? path.extname(originalname) : '';
  const nameWithoutExt = originalname ? path.basename(originalname, ext) : 'document';
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `${cleanName}-${Date.now()}${ext}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${filename}`;
};

const uploadToCloudinary = (buffer, mimetype, originalname) => {
  return new Promise((resolve, reject) => {
    const isPdf = mimetype === 'application/pdf' || (originalname && originalname.toLowerCase().endsWith('.pdf'));
    const isVideo = (mimetype && mimetype.startsWith('video/')) || (originalname && /\.(mp4|webm|ogg)$/i.test(originalname));
    
    // Cloudinary free tier has strict limits: 10MB for raw files (like PDF), 100MB for video.
    const isLargeRaw = isPdf && buffer && buffer.length > 10 * 1024 * 1024;
    const isLargeVideo = isVideo && buffer && buffer.length > 90 * 1024 * 1024;
    
    const hasCloudinaryConfig = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
    
    if (isLargeRaw || isLargeVideo || !hasCloudinaryConfig) {
      try {
        console.log(`Saving file locally (size: ${buffer?.length} bytes) due to size limits or missing Cloudinary configuration.`);
        const localPath = saveLocally(buffer, originalname);
        return resolve({ secure_url: localPath });
      } catch (err) {
        console.error('Error saving file locally:', err);
        return reject(err);
      }
    }

    const nameWithoutExt = originalname ? originalname.split('.').slice(0, -1).join('.') : 'document';
    
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: 'notevaultpro', 
        resource_type: isPdf ? 'raw' : 'auto',
        public_id: isPdf && nameWithoutExt ? nameWithoutExt + '.pdf' : nameWithoutExt,
        format: !isPdf && mimetype === 'application/pdf' ? 'pdf' : undefined
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error, falling back to local storage:', error);
          try {
            const localPath = saveLocally(buffer, originalname);
            resolve({ secure_url: localPath });
          } catch (err) {
            reject(error);
          }
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