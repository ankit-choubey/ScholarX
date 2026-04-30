const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// Check if real Cloudinary creds are configured
const hasCloudinary = (
  process.env.CLOUDINARY_URL ||
  (
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== 'your_api_secret'
  )
);

let storage;

if (hasCloudinary) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('../config/cloudinary');
  console.log('File uploads: using Cloudinary storage');
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:          'scholarx/papers',
      resource_type:   'raw',
      allowed_formats: ['pdf'],
      format:          'pdf',
    },
  });
} else {
  // Fallback: save PDFs locally to server/uploads/
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  console.log('File uploads: Cloudinary not configured — using local disk storage (uploads/)');
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename:    (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${unique}-${file.originalname}`);
    },
  });
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Only PDF files are allowed'));
  },
});

module.exports = upload;
