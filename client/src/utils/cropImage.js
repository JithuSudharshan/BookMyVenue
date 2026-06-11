export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Generates the cropped image file using canvas API.
 * @param {string} imageSrc - Object URL of the image
 * @param {Object} pixelCrop - The cropped area in pixels
 * @param {string} fileName - Output file name
 * @returns {Promise<File>} - Promise resolving to the cropped File object
 */
export async function getCroppedImg(imageSrc, pixelCrop, fileName = 'cropped-avatar.png') {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate image crop blob.'));
        return;
      }
      const croppedFile = new File([blob], fileName, { type: 'image/png' });
      resolve(croppedFile);
    }, 'image/png');
  });
}
