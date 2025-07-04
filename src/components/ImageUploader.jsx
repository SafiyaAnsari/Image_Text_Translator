import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

const ImageUploader = ({ onImageSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const compressImage = useCallback((file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFile = useCallback(async (file) => {
    if (file && file.type.startsWith('image/')) {
      try {
        // Compress image for faster processing
        const compressedImage = await compressImage(file);
        setSelectedImage(compressedImage);
        sessionStorage.setItem('uploadedImage', compressedImage);
        onImageSelected(compressedImage);
      } catch (error) {
        console.error('Error processing image:', error);
        // Fallback to original file
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          setSelectedImage(result);
          sessionStorage.setItem('uploadedImage', result);
          onImageSelected(result);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [onImageSelected, compressImage]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    sessionStorage.removeItem('uploadedImage');
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-blue-400 bg-blue-50/10' 
            : 'border-slate-600 hover:border-slate-500'
        } ${selectedImage ? 'bg-slate-800/50' : 'bg-slate-800/30'} backdrop-blur-sm`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {selectedImage ? (
          <div className="relative">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="max-h-64 mx-auto rounded-lg shadow-lg"
              loading="lazy"
            />
            <motion.button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            <motion.div 
              className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
              animate={{ 
                rotate: dragActive ? 360 : 0,
                scale: dragActive ? 1.1 : 1 
              }}
              transition={{ duration: 0.3 }}
            >
              <Upload className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <p className="text-xl font-semibold text-white mb-2">
                {dragActive ? 'Drop your image here!' : 'Upload an Image'}
              </p>
              <p className="text-slate-300">
                Drag and drop an image file or click to browse
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Supports JPG, PNG, GIF, WebP (Auto-compressed for faster processing)
              </p>
            </div>
          </div>
        )}
      </motion.div>

      <motion.button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <ImageIcon className="w-5 h-5" />
        <span className="font-semibold">Choose Image</span>
      </motion.button>
    </div>
  );
};

export default ImageUploader;