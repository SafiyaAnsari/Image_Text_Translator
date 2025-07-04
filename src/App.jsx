import React, { useState, useRef, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Languages, 
  CheckCircle,
  Sparkles,
  Zap,
  Loader2
} from 'lucide-react';

// Lazy load heavy components
const ImageUploader = lazy(() => import('./components/ImageUploader'));
const CameraCapture = lazy(() => import('./components/CameraCapture'));
const ImageProcessor = lazy(() => import('./components/ImageProcessor'));
const TranslationPanel = lazy(() => import('./components/TranslationPanel'));

// Loading component
const ComponentLoader = ({ children }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-x-3">
      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      <span className="text-slate-300">Loading {children}...</span>
    </div>
  </div>
);

function App() {
  const [currentStep, setCurrentStep] = useState('upload');
  const [processedImage, setProcessedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleImageProcessed = useCallback((result) => {
    setProcessedImage(result);
    setCurrentStep('translate');
  }, []);

  const handleNewImage = useCallback(() => {
    setCurrentStep('upload');
    setProcessedImage(null);
    setShowCamera(false);
  }, []);

  const steps = [
    { id: 'upload', label: 'Upload Image', icon: Upload },
    { id: 'process', label: 'Extract Text', icon: Zap },
    { id: 'translate', label: 'Translate & Overlay', icon: Languages }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Simplified Background - removed heavy animations */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 rotate-12"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-indigo-600/10 to-pink-600/10 -rotate-12"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">ImageTranslate Pro</h1>
                <p className="text-slate-300">AI-Powered Image Text Translation</p>
              </div>
            </div>
            <motion.button 
              onClick={handleNewImage}
              className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              New Image
            </motion.button>
          </div>
        </motion.div>
      </header>

      {/* Progress Steps */}
      <div className="relative z-10 px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center space-x-8">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              const Icon = step.icon;

              return (
                <motion.div 
                  key={step.id}
                  className={`flex flex-col items-center space-y-2 ${
                    isActive || isCompleted ? 'opacity-100' : 'opacity-50'
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isActive || isCompleted ? 1 : 0.5, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={`p-4 rounded-full border-2 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500' 
                      : isActive 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-slate-700 border-slate-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-white">{step.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <Suspense fallback={<ComponentLoader>Image Uploader</ComponentLoader>}>
                    <ImageUploader 
                      onImageSelected={(image) => {
                        setCurrentStep('process');
                      }}
                    />
                  </Suspense>
                  <div className="space-y-6">
                    <motion.button
                      onClick={() => setShowCamera(!showCamera)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Camera className="w-6 h-6" />
                      <span className="font-semibold">
                        {showCamera ? 'Hide Camera' : 'Use Camera'}
                      </span>
                    </motion.button>
                    
                    {showCamera && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Suspense fallback={<ComponentLoader>Camera</ComponentLoader>}>
                          <CameraCapture 
                            onImageCaptured={(image) => {
                              setCurrentStep('process');
                              setShowCamera(false);
                            }}
                          />
                        </Suspense>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'process' && (
              <motion.div
                key="process"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<ComponentLoader>Image Processor</ComponentLoader>}>
                  <ImageProcessor onProcessed={handleImageProcessed} />
                </Suspense>
              </motion.div>
            )}

            {currentStep === 'translate' && processedImage && (
              <motion.div
                key="translate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<ComponentLoader>Translation Panel</ComponentLoader>}>
                  <TranslationPanel 
                    processedImage={processedImage}
                    onNewImage={handleNewImage}
                  />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;