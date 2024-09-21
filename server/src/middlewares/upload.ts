// src/middlewares/upload.ts
import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1617181920211.jpg
  },
});

// Initialize upload
const upload = multer({ storage });

export default upload;
