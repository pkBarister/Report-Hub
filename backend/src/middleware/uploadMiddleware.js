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
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload an audio file.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // Limit to 25MB
});

module.exports = upload;