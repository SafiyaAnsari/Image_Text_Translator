import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Square, RotateCcw, X } from 'lucide-react';

const CameraCapture = ({ onImageCaptured }) => {
  const [isActive, setIsActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'environment'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setCapturedImage(null);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        onImageCaptured(imageData);
        stopCamera();
      }
    }
  }, [onImageCaptured, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <motion.div 
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Camera Capture</span>
          </h3>
          <motion.button
            onClick={stopCamera}
            className="text-slate-400 hover:text-white transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
          {capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
            </>
          )}
          
          {isActive && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-4 border-2 border-white/30 rounded-lg"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          {capturedImage ? (
            <motion.button
              onClick={retakePhoto}
              className="flex-1 bg-slate-700 text-white py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={capturePhoto}
              disabled={!isActive}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              whileHover={{ scale: isActive ? 1.02 : 1 }}
              whileTap={{ scale: isActive ? 0.98 : 1 }}
            >
              <Square className="w-4 h-4" />
              <span>Capture Photo</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CameraCapture;