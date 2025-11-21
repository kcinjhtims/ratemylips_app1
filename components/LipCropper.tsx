import React, { useRef, useState, useEffect } from 'react';
import { Button } from './Button';
import { Move, Check, RotateCcw } from 'lucide-react';

interface LipCropperProps {
  imageUrl: string;
  onConfirm: (croppedUrl: string) => void;
  onCancel: () => void;
}

export const LipCropper: React.FC<LipCropperProps> = ({ imageUrl, onConfirm, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const CROP_WIDTH = 300;
  const CROP_HEIGHT = 150; // Tic-tac aspect ratio approx 2:1

  useEffect(() => {
    imageRef.current.src = imageUrl;
    imageRef.current.onload = () => {
      // Center image initially
      setPosition({ x: 0, y: 0 });
      draw();
    };
  }, [imageUrl]);

  useEffect(() => {
    draw();
  }, [scale, position]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas matches screen size for interaction
    const displayWidth = Math.min(window.innerWidth - 32, 400);
    canvas.width = displayWidth;
    canvas.height = displayWidth; // Square workspace

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate center
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.save();
    ctx.translate(cx + position.x, cy + position.y);
    ctx.scale(scale, scale);
    // Draw image centered at origin
    ctx.drawImage(
      imageRef.current, 
      -imageRef.current.width / 2, 
      -imageRef.current.height / 2
    );
    ctx.restore();

    // Draw Mask Overlay (The "Tic-Tac")
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    // Outer rectangle (full canvas)
    ctx.rect(0, 0, canvas.width, canvas.height);
    // Inner rounded rectangle (cutout) using counter-clockwise rect to create hole
    // Tic-tac shape math
    const cropX = (canvas.width - CROP_WIDTH) / 2;
    const cropY = (canvas.height - CROP_HEIGHT) / 2;
    const radius = CROP_HEIGHT / 2; // Pill shape

    ctx.moveTo(cropX + radius, cropY);
    ctx.lineTo(cropX + CROP_WIDTH - radius, cropY);
    ctx.arcTo(cropX + CROP_WIDTH, cropY, cropX + CROP_WIDTH, cropY + CROP_HEIGHT, radius);
    ctx.lineTo(cropX + CROP_WIDTH, cropY + CROP_HEIGHT - radius);
    ctx.arcTo(cropX + CROP_WIDTH, cropY + CROP_HEIGHT, cropX + CROP_WIDTH - radius, cropY + CROP_HEIGHT, radius);
    ctx.lineTo(cropX + radius, cropY + CROP_HEIGHT);
    ctx.arcTo(cropX, cropY + CROP_HEIGHT, cropX, cropY + CROP_HEIGHT - radius, radius);
    ctx.lineTo(cropX, cropY + radius);
    ctx.arcTo(cropX, cropY, cropX + radius, cropY, radius);
    ctx.closePath();
    
    ctx.fill("evenodd");
    
    // Guide border
    ctx.strokeStyle = '#e11d48'; // Rose-600
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cropX + radius, cropY);
    ctx.lineTo(cropX + CROP_WIDTH - radius, cropY);
    ctx.arcTo(cropX + CROP_WIDTH, cropY, cropX + CROP_WIDTH, cropY + CROP_HEIGHT, radius);
    ctx.lineTo(cropX + CROP_WIDTH, cropY + CROP_HEIGHT - radius);
    ctx.arcTo(cropX + CROP_WIDTH, cropY + CROP_HEIGHT, cropX + CROP_WIDTH - radius, cropY + CROP_HEIGHT, radius);
    ctx.lineTo(cropX + radius, cropY + CROP_HEIGHT);
    ctx.arcTo(cropX, cropY + CROP_HEIGHT, cropX, cropY + CROP_HEIGHT - radius, radius);
    ctx.lineTo(cropX, cropY + radius);
    ctx.arcTo(cropX, cropY, cropX + radius, cropY, radius);
    ctx.stroke();
    ctx.restore();
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartPos({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - startPos.x,
      y: clientY - startPos.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const generateCrop = () => {
    const canvas = document.createElement('canvas');
    canvas.width = CROP_WIDTH;
    canvas.height = CROP_HEIGHT;
    const ctx = canvas.getContext('2d');
    if(!ctx || !canvasRef.current) return;

    // The visible center of our editor canvas
    const editorCx = canvasRef.current.width / 2;
    const editorCy = canvasRef.current.height / 2;
    
    // Map the image transform to the new small canvas
    // We want the center of the "hole" (which is editorCx, editorCy) to correspond to center of new canvas
    
    ctx.save();
    // Move to center of new canvas
    ctx.translate(CROP_WIDTH / 2, CROP_HEIGHT / 2);
    // Apply same user transforms
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);
    // Draw centered
    ctx.drawImage(imageRef.current, -imageRef.current.width / 2, -imageRef.current.height / 2);
    ctx.restore();

    // Create pill shape mask on the result
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    const radius = CROP_HEIGHT / 2;
    ctx.roundRect(0, 0, CROP_WIDTH, CROP_HEIGHT, radius);
    ctx.fill();

    onConfirm(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark flex flex-col items-center justify-center p-4 animate-fade-in">
      <h3 className="text-xl font-serif text-white mb-4">Position Your Lips</h3>
      <p className="text-sm text-gray-400 mb-6 text-center max-w-xs">
        Pinch to zoom. Drag to center lips in the guide.
      </p>
      
      <canvas 
        ref={canvasRef}
        className="rounded-xl shadow-2xl shadow-rose-900/20 cursor-move touch-none"
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      <div className="flex items-center gap-4 mt-6 w-full max-w-xs px-4">
        <span className="text-xs text-gray-500">Zoom</span>
        <input 
          type="range" 
          min="0.5" 
          max="3" 
          step="0.1" 
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="w-full accent-rose-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex gap-4 mt-8">
        <Button variant="ghost" onClick={onCancel}>
            <RotateCcw size={20} />
        </Button>
        <Button onClick={generateCrop}>
            <Check size={20} className="mr-2" />
            Confirm Crop
        </Button>
      </div>
    </div>
  );
};