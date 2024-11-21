import React, { useRef, useState } from 'react';
import { analyzeImage } from '../api/ImageDetectionApi';
import { Upload, AlertCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

const ImageCapture = ({ onItemsDetected }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, or WebP)');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size should be less than 5MB');
    }
    return true;
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const resizeImage = async (file, maxWidth = 800, maxHeight = 800) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
  
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
  
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
  
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: file.type }));
          }, file.type);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };
  
  const handleFileUpload = async (event) => {
    setError(null);
    setLoading(true);
    try {
      const file = event.target.files[0];
      if (!file) return;
  
      validateFile(file);
      
      // Resize the image before converting to base64
      const resizedFile = await resizeImage(file);
      const base64Data = await convertToBase64(resizedFile);
      
      const detectedItems = await analyzeImage(base64Data);
      onItemsDetected(detectedItems);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Scan Items</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a photo of your items to automatically add them to your pantry
          </p>
          
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Upload Photo
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: JPEG, PNG, WebP (max 5MB)
          </p>
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ImageCapture;