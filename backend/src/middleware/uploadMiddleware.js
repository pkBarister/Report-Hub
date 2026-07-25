const multer = require('multer');
const path = require('path');

// Configure storage to save files in an 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename: timestamp-originalname
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filter to ensure only audio files are uploaded
const audioFileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload an audio file.'), false);
  }
};

// Filter to ensure only document files are uploaded
const documentFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.docx', '.doc', '.txt', '.md'];
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid document format. Allowed formats: .docx, .pdf, .txt, .md'), false);
  }
};

// Filter to ensure only image files are uploaded
const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
  if (allowedExts.includes(ext) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Allowed formats: .png, .jpg, .jpeg, .webp, .gif'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter: audioFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // Limit to 25MB
});

const documentUpload = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // Limit to 20MB
});

const imageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // Limit to 25MB
});

module.exports = upload;
module.exports.documentUpload = documentUpload;
module.exports.imageUpload = imageUpload;