import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Eye, FileText, Zap, AlertCircle } from 'lucide-react';

// Lazy load Tesseract only when needed
let Tesseract = null;

const ImageProcessor = ({ onProcessed }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [currentImage, setCurrentImage] = useState('');
  const [error, setError] = useState(null);

  const loadTesseract = useCallback(async () => {
    if (!Tesseract) {
      setStatus('Loading OCR engine...');
      const tesseractModule = await import('tesseract.js');
      Tesseract = tesseractModule.default;
    }
    return Tesseract;
  }, []);

  const optimizeImage = useCallback((imageData) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Optimize image size for faster processing
        const maxWidth = 800; // Reduced from 1200
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Use lower quality for faster processing
        const optimizedImageData = canvas.toDataURL('image/jpeg', 0.6);
        resolve({ optimizedImageData, scale });
      };
      
      img.src = imageData;
    });
  }, []);

  const processImage = useCallback(async (imageData) => {
    try {
      setError(null);
      setStatus('Preparing image...');
      setProgress(5);

      // Optimize image first
      const { optimizedImageData, scale } = await optimizeImage(imageData);
      setProgress(15);

      // Load Tesseract dynamically
      const TesseractLib = await loadTesseract();
      setProgress(25);

      setStatus('Extracting text...');

      // Use faster OCR settings
      const result = await TesseractLib.recognize(optimizedImageData, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progressPercent = Math.round(m.progress * 60) + 30;
            setProgress(progressPercent);
            setStatus(`Extracting text... ${progressPercent}%`);
          }
        },
        // Optimize OCR settings for speed
        tessedit_pageseg_mode: '6', // Uniform block of text
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?-',
      });

      setStatus('Processing results...');
      setProgress(95);

      // Filter and scale back coordinates
      const extractedTexts = result.data.words
        .filter(word => word.confidence > 25 && word.text.trim().length > 0)
        .map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: {
            x0: word.bbox.x0 / scale,
            y0: word.bbox.y0 / scale,
            x1: word.bbox.x1 / scale,
            y1: word.bbox.y1 / scale
          }
        }));

      const processedResult = {
        originalImage: imageData,
        extractedTexts,
        fullText: result.data.text,
        detectedLanguage: detectLanguage(result.data.text)
      };

      setProgress(100);
      setStatus('Complete!');
      
      setTimeout(() => {
        onProcessed(processedResult);
      }, 300);

    } catch (error) {
      console.error('OCR Error:', error);
      setError('Failed to process image. Please try again with a clearer image.');
      setStatus('Error occurred');
    }
  }, [onProcessed, optimizeImage, loadTesseract]);

  const detectLanguage = (text) => {
    const koreanPattern = /[\u3131-\u3163\uAC00-\uD7A3]/;
    const chinesePattern = /[\u4E00-\u9FFF]/;
    const arabicPattern = /[\u0600-\u06FF]/;
    const hindiPattern = /[\u0900-\u097F]/;
    const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF]/;

    if (koreanPattern.test(text)) return 'Korean';
    if (chinesePattern.test(text)) return 'Chinese';
    if (arabicPattern.test(text)) return 'Arabic';
    if (hindiPattern.test(text)) return 'Hindi';
    if (japanesePattern.test(text)) return 'Japanese';
    
    return 'English';
  };

  useEffect(() => {
    const uploadedImage = sessionStorage.getItem('uploadedImage');
    if (uploadedImage) {
      setCurrentImage(uploadedImage);
      processImage(uploadedImage);
    } else {
      setError('No image found. Please upload an image first.');
    }
  }, [processImage]);

  if (error) {
    return (
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-8 border border-red-500/20">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-red-300">Processing Error</h2>
            <p className="text-red-200">{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
        <div className="text-center space-y-6">
          <motion.div 
            className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            animate={{ rotate: progress < 100 ? 360 : 0 }}
            transition={{ duration: 2, repeat: progress < 100 ? Infinity : 0, ease: "linear" }}
          >
            {progress < 100 ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : (
              <Zap className="w-10 h-10 text-white" />
            )}
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Processing Your Image</h2>
            <p className="text-slate-300">{status}</p>
          </div>

          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          <div className="text-sm text-slate-400">
            {progress}% Complete
          </div>

          {currentImage && (
            <div className="mt-6">
              <img 
                src={currentImage} 
                alt="Processing" 
                className="max-h-48 mx-auto rounded-lg shadow-lg opacity-75"
                loading="lazy"
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { icon: Eye, label: 'Image Analysis', step: 1 },
              { icon: FileText, label: 'Text Extraction', step: 2 },
              { icon: Zap, label: 'Language Detection', step: 3 }
            ].map(({ icon: Icon, label, step }) => {
              const isActive = progress >= (step * 33.33);
              const isCompleted = progress >= (step * 33.33);
              
              return (
                <motion.div 
                  key={step}
                  className={`p-4 rounded-lg border ${
                    isCompleted 
                      ? 'bg-green-500/20 border-green-500/50' 
                      : isActive 
                        ? 'bg-blue-500/20 border-blue-500/50' 
                        : 'bg-slate-700/50 border-slate-600'
                  } transition-all duration-300`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: step * 0.05 }}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    isCompleted ? 'text-green-400' : isActive ? 'text-blue-400' : 'text-slate-500'
                  }`} />
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-green-300' : isActive ? 'text-blue-300' : 'text-slate-400'
                  }`}>
                    {label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageProcessor;