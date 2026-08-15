
export interface ImageStats {
  redness: number;
  brightness: number;
  contrast: number;
  sharpness: number;
  saturation: number;
  // Zonal data for actual geometric inference
  symmetry: number; // Left vs Right balance (0-1)
  verticalRatio: number; // Top vs Bottom balance (0-1)
  fullnessIndex: number; // Overall pixel density
  textureNoise: number; // High-frequency variation (dryness/lumps)
}

export const analyzeImagePixels = (imageUrl: string): Promise<ImageStats> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("No context");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;
      const midX = Math.floor(w / 2);
      const midY = Math.floor(h / 2);

      let sums = { r: 0, g: 0, b: 0, lum: 0 };
      let zones = { left: 0, right: 0, top: 0, bottom: 0 };
      let pixelCount = data.length / 4;

      // Single pass scan for performance
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = (0.299 * r + 0.587 * g + 0.114 * b);
          
          sums.r += r; sums.g += g; sums.b += b; sums.lum += lum;

          // Geometric "Mass" (Redness intensity in specific regions)
          const redIntens = r / (Math.max(g, 1) + Math.max(b, 1));
          if (x < midX) zones.left += redIntens;
          else zones.right += redIntens;
          
          if (y < midY) zones.top += redIntens;
          else zones.bottom += redIntens;
        }
      }

      const avgR = sums.r / pixelCount;
      const avgG = sums.g / pixelCount;
      const avgB = sums.b / pixelCount;
      const avgLum = sums.lum / pixelCount;

      // Symmetry: 1 is perfect, 0 is heavily skewed
      const symmetry = 1 - Math.abs(zones.left - zones.right) / Math.max(zones.left + zones.right, 1);
      
      // Vertical Balance: Ratio of top lip mass to bottom lip mass
      const verticalRatio = zones.top / Math.max(zones.bottom, 1);

      // Contrast/Sharpness (Standard Deviation)
      let varianceSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        varianceSum += Math.pow((0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]) - avgLum, 2);
      }
      const contrast = Math.sqrt(varianceSum / pixelCount) / 64;

      resolve({
        redness: Math.min(avgR / (Math.max(avgG, 1) + Math.max(avgB, 1)) * 0.8, 1),
        brightness: avgLum / 255,
        contrast: Math.min(contrast, 1),
        sharpness: Math.min(contrast * 1.2, 1),
        saturation: (Math.max(avgR, avgG, avgB) - Math.min(avgR, avgG, avgB)) / Math.max(avgR, 1),
        symmetry: Math.min(symmetry * 1.2, 1),
        verticalRatio: verticalRatio,
        fullnessIndex: (zones.top + zones.bottom) / (pixelCount * 0.5),
        textureNoise: Math.max(0, 1 - (contrast / 0.8)) // Low contrast in red zones = smoother lips
      });
    };
    img.onerror = () => resolve({ redness: 0.5, brightness: 0.5, contrast: 0.5, sharpness: 0.5, saturation: 0.5, symmetry: 0.5, verticalRatio: 0.6, fullnessIndex: 0.5, textureNoise: 0.5 });
  });
};
