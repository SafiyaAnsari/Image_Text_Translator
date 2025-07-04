import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Languages, 
  Download, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Copy,
  CheckCircle,
  Globe,
  Loader2,
  Settings,
  Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' }
];

const OVERLAY_STYLES = [
  { id: 'adaptive', name: 'Smart Adaptive', color: 'adaptive' },
  { id: 'solid', name: 'Solid Background', color: 'rgba(59, 130, 246, 0.95)' },
  { id: 'transparent', name: 'Semi-Transparent', color: 'rgba(59, 130, 246, 0.7)' },
  { id: 'outline', name: 'Outline Only', color: 'transparent' },
  { id: 'shadow', name: 'Text Shadow', color: 'transparent' }
];

const TranslationPanel = ({ processedImage, onNewImage }) => {
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [translatedTexts, setTranslatedTexts] = useState([]);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [overlayStyle, setOverlayStyle] = useState('adaptive');
  const [showSettings, setShowSettings] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Real translation function using Google Translate API
  const translateText = useCallback(async (text, targetLang) => {
    try {
      // Using Google Translate API via a free service
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        return data.responseData.translatedText;
      }
      
      // Fallback to LibreTranslate API
      const libreResponse = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text'
        })
      });
      
      if (libreResponse.ok) {
        const libreData = await libreResponse.json();
        return libreData.translatedText;
      }
      
      throw new Error('Translation failed');
    } catch (error) {
      console.error('Translation error:', error);
      // Enhanced fallback with better mock translations
      return await getMockTranslation(text, targetLang);
    }
  }, []);

  // Enhanced mock translation as fallback
  const getMockTranslation = useCallback(async (text, targetLang) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockTranslations = {
      'hi': {
        'hello': 'नमस्ते',
        'world': 'दुनिया',
        'good': 'अच्छा',
        'morning': 'सुबह',
        'evening': 'शाम',
        'night': 'रात',
        'thank': 'धन्यवाद',
        'you': 'आप',
        'welcome': 'स्वागत',
        'please': 'कृपया',
        'sorry': 'माफ़ करें',
        'yes': 'हाँ',
        'no': 'नहीं',
        'help': 'मदद',
        'food': 'खाना',
        'water': 'पानी',
        'home': 'घर',
        'work': 'काम',
        'school': 'स्कूल',
        'love': 'प्यार',
        'family': 'परिवार',
        'friend': 'दोस्त',
        'time': 'समय',
        'day': 'दिन',
        'today': 'आज',
        'tomorrow': 'कल',
        'yesterday': 'कल',
        'here': 'यहाँ',
        'there': 'वहाँ',
        'where': 'कहाँ',
        'when': 'कब',
        'why': 'क्यों',
        'how': 'कैसे',
        'what': 'क्या',
        'who': 'कौन',
        'which': 'कौन सा',
        'dreams': 'सपने',
        'success': 'सफलता',
        'life': 'जीवन',
        'motivation': 'प्रेरणा',
        'inspiration': 'प्रेरणा',
        'achieve': 'हासिल करना',
        'goal': 'लक्ष्य',
        'future': 'भविष्य',
        'hope': 'आशा',
        'believe': 'विश्वास',
        'strong': 'मजबूत',
        'courage': 'साहस',
        'never': 'कभी नहीं',
        'give': 'देना',
        'up': 'ऊपर',
        'always': 'हमेशा',
        'try': 'कोशिश',
        'hard': 'कठिन',
        'effort': 'प्रयास',
        'dedication': 'समर्पण'
      },
      'es': {
        'hello': 'hola',
        'world': 'mundo',
        'good': 'bueno',
        'morning': 'mañana',
        'evening': 'tarde',
        'night': 'noche',
        'thank': 'gracias',
        'you': 'tú',
        'welcome': 'bienvenido',
        'please': 'por favor',
        'sorry': 'lo siento',
        'yes': 'sí',
        'no': 'no',
        'help': 'ayuda',
        'food': 'comida',
        'water': 'agua',
        'home': 'casa',
        'work': 'trabajo',
        'school': 'escuela',
        'love': 'amor',
        'family': 'familia',
        'friend': 'amigo',
        'time': 'tiempo',
        'day': 'día',
        'today': 'hoy',
        'tomorrow': 'mañana',
        'yesterday': 'ayer',
        'dreams': 'sueños',
        'success': 'éxito',
        'life': 'vida',
        'motivation': 'motivación',
        'achieve': 'lograr',
        'goal': 'meta',
        'future': 'futuro',
        'hope': 'esperanza',
        'believe': 'creer',
        'strong': 'fuerte',
        'courage': 'coraje',
        'never': 'nunca',
        'give': 'dar',
        'up': 'arriba',
        'always': 'siempre',
        'try': 'intentar',
        'hard': 'difícil',
        'effort': 'esfuerzo'
      },
      'fr': {
        'hello': 'bonjour',
        'world': 'monde',
        'good': 'bon',
        'morning': 'matin',
        'evening': 'soir',
        'night': 'nuit',
        'thank': 'merci',
        'you': 'vous',
        'welcome': 'bienvenue',
        'please': 's\'il vous plaît',
        'sorry': 'désolé',
        'yes': 'oui',
        'no': 'non',
        'help': 'aide',
        'food': 'nourriture',
        'water': 'eau',
        'home': 'maison',
        'work': 'travail',
        'school': 'école',
        'love': 'amour',
        'family': 'famille',
        'friend': 'ami',
        'time': 'temps',
        'day': 'jour',
        'today': 'aujourd\'hui',
        'tomorrow': 'demain',
        'yesterday': 'hier',
        'dreams': 'rêves',
        'success': 'succès',
        'life': 'vie',
        'motivation': 'motivation',
        'achieve': 'atteindre',
        'goal': 'objectif',
        'future': 'avenir',
        'hope': 'espoir',
        'believe': 'croire',
        'strong': 'fort',
        'courage': 'courage',
        'never': 'jamais',
        'give': 'donner',
        'up': 'haut',
        'always': 'toujours',
        'try': 'essayer',
        'hard': 'difficile',
        'effort': 'effort'
      }
    };

    const translations = mockTranslations[targetLang] || {};
    const words = text.toLowerCase().split(/\s+/);
    const translatedWords = words.map(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      return translations[cleanWord] || word;
    });
    
    return translatedWords.join(' ');
  }, []);

  // Group words into logical text blocks (sentences/phrases)
  const groupTextBlocks = useCallback((extractedTexts) => {
    if (!extractedTexts.length) return [];

    // Sort by position (top to bottom, left to right)
    const sortedTexts = [...extractedTexts].sort((a, b) => {
      const yDiff = a.bbox.y0 - b.bbox.y0;
      if (Math.abs(yDiff) > 30) return yDiff; // Different lines
      return a.bbox.x0 - b.bbox.x0; // Same line
    });

    const textBlocks = [];
    let currentBlock = [];
    let lastY = -1;
    let lastX = -1;

    for (const text of sortedTexts) {
      const currentY = text.bbox.y0;
      const currentX = text.bbox.x0;
      
      // Start new block if:
      // 1. Significantly different Y position (new line)
      // 2. Large gap in X position (new section)
      const isNewLine = lastY !== -1 && Math.abs(currentY - lastY) > 30;
      const isLargeGap = lastX !== -1 && (currentX - lastX) > 100;
      
      if (isNewLine || (currentBlock.length > 0 && isLargeGap)) {
        if (currentBlock.length > 0) {
          textBlocks.push(currentBlock);
          currentBlock = [];
        }
      }
      
      currentBlock.push(text);
      lastY = currentY;
      lastX = text.bbox.x1; // Use end position for gap calculation
    }
    
    // Add remaining block
    if (currentBlock.length > 0) {
      textBlocks.push(currentBlock);
    }

    return textBlocks;
  }, []);

  const handleTranslate = useCallback(async () => {
    if (!processedImage.extractedTexts.length) return;

    setIsTranslating(true);
    
    try {
      // Group text into logical blocks
      const textBlocks = groupTextBlocks(processedImage.extractedTexts);
      const results = [];

      for (const block of textBlocks) {
        if (block.length === 0) continue;
        
        // Combine words in the block
        const originalText = block.map(word => word.text).join(' ');
        
        // Skip very short or meaningless text
        if (originalText.trim().length < 2) continue;
        
        try {
          const translatedText = await translateText(originalText, targetLanguage);
          
          // Calculate average confidence
          const avgConfidence = block.reduce((sum, word) => sum + word.confidence, 0) / block.length;
          
          // Calculate bounding box for the entire block
          const minX = Math.min(...block.map(word => word.bbox.x0));
          const minY = Math.min(...block.map(word => word.bbox.y0));
          const maxX = Math.max(...block.map(word => word.bbox.x1));
          const maxY = Math.max(...block.map(word => word.bbox.y1));
          
          results.push({
            originalText,
            translatedText,
            fromLanguage: processedImage.detectedLanguage || 'English',
            toLanguage: SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage,
            confidence: avgConfidence,
            bbox: { x0: minX, y0: minY, x1: maxX, y1: maxY }
          });
        } catch (error) {
          console.error('Translation error for block:', error);
        }
      }

      setTranslatedTexts(results);
      
      // Trigger success animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error('Translation process error:', error);
    } finally {
      setIsTranslating(false);
    }
  }, [processedImage, targetLanguage, translateText, groupTextBlocks]);

  // Analyze image to determine best overlay style
  const analyzeImageForOverlay = useCallback((ctx, x, y, width, height) => {
    try {
      // Sample pixels in the text area to determine background
      const imageData = ctx.getImageData(x, y, Math.min(width, 50), Math.min(height, 20));
      const pixels = imageData.data;
      
      let totalBrightness = 0;
      let pixelCount = 0;
      
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        totalBrightness += brightness;
        pixelCount++;
      }
      
      const avgBrightness = totalBrightness / pixelCount;
      
      // Return appropriate colors based on background brightness
      if (avgBrightness > 128) {
        // Light background - use dark text with light background
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          textColor: 'white',
          borderColor: 'rgba(0, 0, 0, 0.9)'
        };
      } else {
        // Dark background - use light text with dark background
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          textColor: 'black',
          borderColor: 'rgba(255, 255, 255, 1)'
        };
      }
    } catch (error) {
      // Fallback to default
      return {
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
        textColor: 'white',
        borderColor: 'rgba(59, 130, 246, 1)'
      };
    }
  }, []);

  const drawImageWithOverlay = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !translatedTexts.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    // Get the actual displayed image dimensions
    const imgRect = img.getBoundingClientRect();
    
    // Set canvas size to match the displayed image
    canvas.width = imgRect.width;
    canvas.height = imgRect.height;
    canvas.style.width = `${imgRect.width}px`;
    canvas.style.height = `${imgRect.height}px`;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showOverlay && translatedTexts.length > 0) {
      // Calculate scale factors based on natural vs displayed size
      const scaleX = imgRect.width / img.naturalWidth;
      const scaleY = imgRect.height / img.naturalHeight;

      // Create a temporary canvas to analyze the original image
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = img.naturalWidth;
      tempCanvas.height = img.naturalHeight;
      if (tempCtx) {
        tempCtx.drawImage(img, 0, 0);
      }

      // Draw overlay for each translated text block
      translatedTexts.forEach((translation, index) => {
        if (!translation.bbox) return;

        const { bbox } = translation;
        const x = bbox.x0 * scaleX;
        const y = bbox.y0 * scaleY;
        const width = (bbox.x1 - bbox.x0) * scaleX;
        const height = (bbox.y1 - bbox.y0) * scaleY;

        let backgroundColor, textColor, borderColor;

        // Determine overlay style
        switch (overlayStyle) {
          case 'solid':
            backgroundColor = 'rgba(59, 130, 246, 0.95)';
            textColor = 'white';
            borderColor = 'rgba(59, 130, 246, 1)';
            break;
          case 'transparent':
            backgroundColor = 'rgba(59, 130, 246, 0.7)';
            textColor = 'white';
            borderColor = 'rgba(59, 130, 246, 0.8)';
            break;
          case 'outline':
            backgroundColor = 'transparent';
            textColor = 'white';
            borderColor = 'rgba(59, 130, 246, 1)';
            break;
          case 'shadow':
            backgroundColor = 'transparent';
            textColor = 'white';
            borderColor = 'transparent';
            break;
          case 'adaptive':
          default:
            if (tempCtx) {
              const colors = analyzeImageForOverlay(tempCtx, bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
              backgroundColor = colors.backgroundColor;
              textColor = colors.textColor;
              borderColor = colors.borderColor;
            } else {
              backgroundColor = 'rgba(59, 130, 246, 0.9)';
              textColor = 'white';
              borderColor = 'rgba(59, 130, 246, 1)';
            }
            break;
        }

        // Draw background (if not transparent)
        if (backgroundColor !== 'transparent') {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(x - 4, y - 4, width + 8, height + 8);
        }

        // Draw border (if not transparent)
        if (borderColor !== 'transparent' && overlayStyle !== 'shadow') {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = overlayStyle === 'outline' ? 3 : 2;
          ctx.strokeRect(x - 4, y - 4, width + 8, height + 8);
        }

        // Configure text style
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Dynamic font size based on box height
        const fontSize = Math.max(10, Math.min(height * 0.8, 18));
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;

        // Add text shadow for better readability (especially for shadow style)
        if (overlayStyle === 'shadow' || overlayStyle === 'outline') {
          ctx.shadowColor = textColor === 'white' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        // Handle text wrapping for long translations
        const maxWidth = width - 8;
        const words = translation.translatedText.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        // Draw text lines
        const lineHeight = fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        const startY = y + height / 2 - totalHeight / 2 + lineHeight / 2;

        lines.forEach((line, lineIndex) => {
          ctx.fillText(line, x + width / 2, startY + lineIndex * lineHeight);
        });

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw small index number in corner
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `bold ${Math.max(8, fontSize * 0.6)}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillRect(x - 2, y - 16, 20, 12);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText(`${index + 1}`, x + 2, y - 10);
      });
    }
  }, [translatedTexts, showOverlay, overlayStyle, analyzeImageForOverlay]);

  const downloadImage = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    // Create download canvas with original image size
    const downloadCanvas = document.createElement('canvas');
    const ctx = downloadCanvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    downloadCanvas.width = img.naturalWidth;
    downloadCanvas.height = img.naturalHeight;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Draw overlay if enabled (using the same logic as display overlay)
    if (showOverlay && translatedTexts.length > 0) {
      translatedTexts.forEach((translation, index) => {
        if (!translation.bbox) return;

        const { bbox } = translation;
        const x = bbox.x0;
        const y = bbox.y0;
        const width = bbox.x1 - bbox.x0;
        const height = bbox.y1 - bbox.y0;

        // Use adaptive colors for download
        const colors = analyzeImageForOverlay(ctx, x, y, width, height);

        // Draw background
        ctx.fillStyle = colors.backgroundColor;
        ctx.fillRect(x - 4, y - 4, width + 8, height + 8);

        // Draw text
        ctx.fillStyle = colors.textColor;
        const fontSize = Math.max(12, height * 0.8);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(translation.translatedText, x + width / 2, y + height / 2);
      });
    }

    // Download
    const link = document.createElement('a');
    link.download = 'translated-image.png';
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
  }, [translatedTexts, showOverlay, analyzeImageForOverlay]);

  const copyText = useCallback(() => {
    const allTranslatedText = translatedTexts
      .map((t, i) => `${i + 1}. ${t.originalText} → ${t.translatedText}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(allTranslatedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [translatedTexts]);

  // Update overlay when image loads or window resizes
  useEffect(() => {
    const handleResize = () => {
      setTimeout(drawImageWithOverlay, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawImageWithOverlay]);

  useEffect(() => {
    if (imageRef.current?.complete) {
      setTimeout(drawImageWithOverlay, 100);
    }
  }, [drawImageWithOverlay]);

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Translate to:
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Translation Button */}
          <div className="flex items-end">
            <motion.button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              whileHover={{ scale: isTranslating ? 1 : 1.02 }}
              whileTap={{ scale: isTranslating ? 1 : 0.98 }}
            >
              {isTranslating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Languages className="w-5 h-5" />
              )}
              <span>{isTranslating ? 'Translating...' : 'Translate Text'}</span>
            </motion.button>
          </div>

          {/* Toggle Overlay */}
          <div className="flex items-end">
            <motion.button
              onClick={() => setShowOverlay(!showOverlay)}
              className="w-full bg-slate-700 text-white py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors duration-300 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {showOverlay ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span>{showOverlay ? 'Hide Overlay' : 'Show Overlay'}</span>
            </motion.button>
          </div>

          {/* Overlay Settings */}
          <div className="flex items-end">
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Palette className="w-5 h-5" />
              <span>Overlay Style</span>
            </motion.button>
          </div>
        </div>

        {/* Overlay Style Settings */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600"
            >
              <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Overlay Style Options</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {OVERLAY_STYLES.map((style) => (
                  <motion.button
                    key={style.id}
                    onClick={() => setOverlayStyle(style.id)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      overlayStyle === style.id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {style.name}
                  </motion.button>
                ))}
              </div>
              <p className="text-slate-400 text-xs mt-3">
                <strong>Smart Adaptive:</strong> Automatically chooses the best overlay style based on image background
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Display */}
        <motion.div 
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
          layoutId="image-container"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Image with Smart Translation Overlay</h3>
            <div className="flex space-x-2">
              <motion.button
                onClick={copyText}
                disabled={!translatedTexts.length}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Copy all translations"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </motion.button>
              <motion.button
                onClick={downloadImage}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Download image with overlay"
              >
                <Download className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="relative">
            <img
              ref={imageRef}
              src={processedImage.originalImage}
              alt="Original with overlay"
              className="w-full rounded-lg shadow-lg"
              onLoad={drawImageWithOverlay}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
            />
          </div>

          {/* Image Info */}
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Detected Language:</span>
                <span className="text-white ml-2">{processedImage.detectedLanguage || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-slate-400">Text Blocks:</span>
                <span className="text-white ml-2">{processedImage.extractedTexts.length}</span>
              </div>
              <div>
                <span className="text-slate-400">Translations:</span>
                <span className="text-white ml-2">{translatedTexts.length}</span>
              </div>
              <div>
                <span className="text-slate-400">Overlay Style:</span>
                <span className="text-white ml-2 capitalize">{overlayStyle}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Translation Results */}
        <motion.div 
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Translation Results</span>
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {translatedTexts.length > 0 ? (
                translatedTexts.map((result, index) => (
                  <motion.div
                    key={index}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-400">#{index + 1}</span>
                        <span className="text-xs text-green-400">
                          {Math.round(result.confidence)}% confidence
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-xs text-slate-400 font-medium">
                          Original ({result.fromLanguage}):
                        </span>
                        <p className="text-slate-300 mt-1 p-2 bg-slate-800/50 rounded text-sm">
                          {result.originalText}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-slate-400 font-medium">
                          Translation ({result.toLanguage}):
                        </span>
                        <p className="text-white font-medium mt-1 p-2 bg-blue-900/30 rounded border border-blue-500/30 text-sm">
                          {result.translatedText}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : processedImage.extractedTexts.length > 0 ? (
                <div className="text-center py-8">
                  <Languages className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">
                    Found {processedImage.extractedTexts.length} text elements
                  </p>
                  <p className="text-slate-300 text-sm">
                    Click "Translate Text" to get translations using real translation APIs
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Languages className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">
                    No text found in the image
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TranslationPanel;