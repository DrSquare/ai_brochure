import React, { useState, useRef, ReactNode } from 'react';
import { ImageData } from '../types';
import { ImageCropper } from './ImageCropper';
import { EditIcon } from './IconComponents';

interface ImageInputProps {
  id: string;
  title: string;
  onImageUpload: (imageData: ImageData | null) => void;
  icon: ReactNode;
}

export const ImageInput: React.FC<ImageInputProps> = ({ id, title, onImageUpload, icon }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null); // For cropper
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCropConfirm = (croppedImageData: ImageData) => {
    onImageUpload(croppedImageData);
    setPreview(`data:${croppedImageData.mimeType};base64,${croppedImageData.base64}`);
    setImageSrc(null); // Close the cropper
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleCropCancel = () => {
    setImageSrc(null);
     if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) {
        setImageSrc(preview);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <div 
        onClick={handleClick}
        className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-indigo-400 transition-all duration-300 relative group overflow-hidden"
      >
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {preview ? (
          <>
            <img src={preview} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
              <button onClick={handleEdit} type="button" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2 bg-white text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-200">
                <EditIcon className="h-5 w-5"/>
                <span>Edit Crop</span>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 flex flex-col items-center">
            <div className="h-8 w-8 mb-2">{icon}</div>
            <span className="text-sm font-medium">Click to upload</span>
          </div>
        )}
      </div>
      {imageSrc && (
        <ImageCropper 
            imageSrc={imageSrc}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};