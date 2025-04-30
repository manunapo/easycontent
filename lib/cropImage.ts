import { Area } from 'react-easy-crop';

/**
 * Creates an image element from a URL.
 * @param {string} url - The image URL.
 * @returns {Promise<HTMLImageElement>} - A promise that resolves with the image element.
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
    image.src = url;
  });

/**
 * Calculates the rotation needed to orient the image correctly.
 * This function is not used in the current basic implementation but can be useful for handling EXIF orientation.
 * @param {number} rotation - The rotation angle.
 * @returns {{ flip: boolean, rotation: number }} - Flip and rotation values.
 */
export function getRotation(rotation = 0) {
  const angle = rotation * Math.PI / 180;
  const { sin, cos } = Math;

  const sinAngle = sin(angle);
  const cosAngle = cos(angle);

  return { sin: sinAngle, cos: cosAngle };
}


/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 *
 * @param {HTMLImageElement} image - Image File url
 * @param {Area} pixelCrop - pixelCrop Object provided by react-easy-crop
 * @param {number} rotation - Optional rotation angle
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const rotRad = rotation * Math.PI / 180;

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(1, 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0);

  // As Base64 string
  // return canvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      if (file) {
          resolve(URL.createObjectURL(file));
      } else {
          resolve(null); // Handle error case where blob is null
      }
    }, 'image/png'); // Specify image type, e.g., image/png or image/jpeg
  });
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = rotation * Math.PI / 180;

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
} 