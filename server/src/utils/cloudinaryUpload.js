import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'BookMyVenue/vendor_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

export const identityDocStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine the format based on mimetype
    let format = file.mimetype.split('/')[1];
    if (format === 'pdf') {
      return {
        folder: 'BookMyVenue/vendor_identity_docs',
        format: 'pdf',
        resource_type: 'raw', // PDFs need to be stored as 'raw' or 'image' depending on usecase, but standard pdf works as image with page selection, or auto. Using auto for standard storage.
      };
    }
    
    return {
      folder: 'BookMyVenue/vendor_identity_docs',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    };
  },
});

export default cloudinary;
