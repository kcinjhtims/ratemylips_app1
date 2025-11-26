
export interface ImageStats {
  redness: number; // 0-1
  brightness: number; // 0-1
  contrast: number; // 0-1
  sharpness: number; // 0-1
  saturation: number; // 0-1
}

export const analyzeImagePixels = (imageUrl: string): Promise<ImageStats> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject("No context");
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let luminanceSum = 0;
      let pixelCount = data.length / 4;

      // 1. Calculate Averages & Luminance
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        rSum += r;
        gSum += g;
        bSum += b;
        
        // Perceived luminance
        luminanceSum += (0.299 * r + 0.587 * g + 0.114 * b);
      }

      const avgR = rSum / pixelCount;
      const avgG = gSum / pixelCount;
      const avgB = bSum / pixelCount;
      const avgLum = luminanceSum / pixelCount;

      // 2. Calculate Variance (Contrast/Sharpness Proxy)
      let varianceSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = (0.299 * r + 0.587 * g + 0.114 * b);
        varianceSum += Math.pow(lum - avgLum, 2);
      }
      const variance = varianceSum / pixelCount;
      const stdDev = Math.sqrt(variance);

      // 3. Metrics Calculation
      
      // Redness: Ratio of Red to (Green + Blue)
      // Healthy lips are significantly redder than skin. 
      // Pale/Ugly lips lack this ratio.
      const rednessScore = avgR / (Math.max(avgG, 1) + Math.max(avgB, 1)) * 2; 
      
      // Contrast: Standard Deviation normalized
      // Low contrast = blurry/undefined (Bad). High contrast = defined (Good).
      const contrastScore = Math.min(stdDev / 60, 1);

      // Saturation approximation
      const maxCh = Math.max(avgR, avgG, avgB);
      const minCh = Math.min(avgR, avgG, avgB);
      const saturation = maxCh === 0 ? 0 : (maxCh - minCh) / maxCh;

      resolve({
        redness: Math.min(Math.max(rednessScore, 0), 1),
        brightness: Math.min(Math.max(avgLum / 255, 0), 1),
        contrast: contrastScore,
        sharpness: contrastScore, // Using contrast as a proxy for sharpness in raw JS
        saturation: saturation
      });
    };

    img.onerror = () => {
      // Fallback if image fails
      resolve({
        redness: 0.5,
        brightness: 0.5,
        contrast: 0.5,
        sharpness: 0.5,
        saturation: 0.5
      });
    };
  });
};
