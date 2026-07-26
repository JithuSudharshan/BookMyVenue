import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bookmyvenue-avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP formats are allowed.'), false);
  }
};

export const uploadAvatarMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
}).single('avatar');

export const handleUploadError = (err, req, res, next) => {
  if (err) {
    let message = err.message;
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File size limit exceeded. Maximum size allowed is 2MB.';
      } else {
        message = `Upload error: ${err.message}`;
      }
    }
    return res.status(400).json({
      success: false,
      message
    });
  }
  next();
};

import { profileImageStorage, identityDocStorage, categoryImageStorage, venueImageStorage, reviewImageStorage } from '../utils/cloudinaryUpload.js';

export const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadIdentityDoc = multer({
  storage: identityDocStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG and PDF are allowed.'));
    }
  },
});

export const uploadCategoryImage = multer({
  storage: categoryImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.'));
    }
  },
});

export const uploadVenueImage = multer({
  storage: venueImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per venue image
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.'));
    }
  },
});



export const uploadReviewImages = multer({
  storage: reviewImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per review image
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.'));
    }
  },
}).array('images', 3);
