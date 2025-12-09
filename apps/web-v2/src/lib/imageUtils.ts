/**
 * Generate a tiny base64 blur placeholder from an image file
 * Used for progressive image loading
 */
export async function generateBlurPlaceholder(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve('');
      return;
    }

    img.onload = () => {
      // Tiny 10x10 thumbnail for blur effect
      canvas.width = 10;
      canvas.height = 10;
      ctx.drawImage(img, 0, 0, 10, 10);

      // Convert to base64 JPEG at very low quality
      const blurDataUrl = canvas.toDataURL('image/jpeg', 0.1);
      resolve(blurDataUrl);
    };

    img.src = URL.createObjectURL(file);
  });
}
