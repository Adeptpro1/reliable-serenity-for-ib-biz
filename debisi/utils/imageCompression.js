import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before upload.
 * @param {File} imageFile - The original image file.
 * @param {Object} customOptions - Optional custom compression options.
 * @returns {Promise<File>} - The compressed image file.
 */
export const compressImage = async (imageFile, customOptions = {}) => {
  // Don't compress if it's not an image or if it's a GIF (compression breaks animated GIFs)
  if (!imageFile || !imageFile.type.startsWith('image/') || imageFile.type === 'image/gif') {
    return imageFile;
  }

  const defaultOptions = {
    maxSizeMB: 1, // Max file size in MB
    maxWidthOrHeight: 1920, // Max width/height in pixels
    useWebWorker: true, // Use multi-threading for performance
    fileType: 'image/webp', // Convert to WebP for better compression (optional, default is original type)
  };

  const options = { ...defaultOptions, ...customOptions };

  try {
    const compressedFile = await imageCompression(imageFile, options);
    // browser-image-compression returns a Blob, we convert it back to a File
    return new File([compressedFile], imageFile.name, {
      type: options.fileType || imageFile.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    // If compression fails, return the original file to prevent upload failure
    return imageFile;
  }
};
