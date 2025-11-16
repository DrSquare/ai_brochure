import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, PixelCrop } from 'react-image-crop';
import { ImageData } from '../types';
import { CropIcon, FilterIcon } from './IconComponents';

interface ImageCropperProps {
  imageSrc: string;
  onConfirm: (imageData: ImageData) => void;
  onCancel: () => void;
}

type Filter = {
  name: string;
  value: string;
};

const filters: Filter[] = [
  { name: 'None', value: 'none' },
  { name: 'Vintage', value: 'sepia(0.6) contrast(0.9) brightness(1.1) saturate(1.2)' },
  { name: 'B&W', value: 'grayscale(1)' },
  { name: 'Sepia', value: 'sepia(1)' },
];

// Function to generate the cropped image with a filter
function getCroppedImg(image: HTMLImageElement, crop: PixelCrop, mimeType: string, filter: string): string {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get 2d context from canvas');
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    
    ctx.filter = filter; // Apply the selected filter to the canvas context

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );
    
    // As Base64 string
    return canvas.toDataURL(mimeType);
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const imgRef = useRef<HTMLImageElement>(null);

  const handleConfirmCrop = () => {
    if (completedCrop && imgRef.current) {
        // Always output as PNG for consistency and to support transparency
        const mimeType = 'image/png';
        const croppedImageBase64WithHeader = getCroppedImg(imgRef.current, completedCrop, mimeType, selectedFilter);
        const base64String = croppedImageBase64WithHeader.split(',')[1];
        if (base64String) {
          onConfirm({ base64: base64String, mimeType });
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="crop-dialog-title">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl flex flex-col space-y-4">
        <h2 id="crop-dialog-title" className="text-xl font-bold text-gray-800">Edit Your Image</h2>
        <div className="flex justify-center bg-gray-200 p-2 rounded-lg">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            minHeight={100}
            minWidth={100}
            aria-label="Image cropping area"
          >
            <img 
              ref={imgRef}
              src={imageSrc} 
              alt="Source for cropping"
              style={{ maxHeight: '60vh', filter: selectedFilter }}
            />
          </ReactCrop>
        </div>
        <div className="flex flex-col space-y-2">
            <h3 className="text-md font-semibold text-gray-700 flex items-center space-x-2">
                <FilterIcon className="h-5 w-5"/>
                <span>Apply a Filter</span>
            </h3>
            <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
                <button
                key={filter.name}
                onClick={() => setSelectedFilter(filter.value)}
                className={`px-3 py-1 text-sm rounded-full border-2 transition-colors ${
                    selectedFilter === filter.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500'
                }`}
                >
                {filter.name}
                </button>
            ))}
            </div>
        </div>
        <div className="flex justify-end space-x-3 border-t pt-4">
          <button
            onClick={onCancel}
            type="button"
            className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmCrop}
            type="button"
            disabled={!completedCrop?.width || !completedCrop?.height}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
          >
            <CropIcon className="h-5 w-5" />
            <span>Confirm Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
};