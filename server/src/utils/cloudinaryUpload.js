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

/**
 * Delete an identity document from Cloudinary.
 * Handles both image and raw (PDF) resource types.
 * @param {string} url - The Cloudinary URL of the file to delete.
 */
export const deleteIdentityDocFromCloudinary = async (url) => {
  if (!url) return;
  try {
    // Extract the path after /upload/ and before any version or file extension
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return;

    let publicIdWithExt = url.substring(uploadIndex + 8);

    // Strip version segment like v1234567890/
    publicIdWithExt = publicIdWithExt.replace(/^v\d+\//, '');

    // Remove file extension
    const lastDot = publicIdWithExt.lastIndexOf('.');
    const publicId = lastDot !== -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;

    // Determine resource_type: PDFs are stored as 'raw'
    const isPdf = url.toLowerCase().includes('.pdf');
    const resourceType = isPdf ? 'raw' : 'image';

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    // Non-fatal: log but do not block the update
    console.error('Cloudinary delete failed:', err.message);
  }
};

export default cloudinary;
