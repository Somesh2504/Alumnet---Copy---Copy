import cloudinary from 'cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary connected');

// Upload function for Cloudinary
export const uploadToCloudinary = async (filePath, folder = 'general') => {
  try {
    const result = await cloudinaryV2.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      thumbnail_url: result.thumbnail_url || null
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

export default cloudinary;