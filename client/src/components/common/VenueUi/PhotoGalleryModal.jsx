import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const PhotoGalleryModal = ({ images = [], initialIndex = 0, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  }, [images.length]);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen) return null;
  if (!images || images.length === 0) return null;

  const displayImages = images.map(img => (typeof img === 'string' ? img : img.url));

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex flex-col backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white shrink-0">
        <div className="w-10"></div> {/* Spacer for centering */}
        {displayImages.length > 1 && (
          <div className="text-sm font-medium">
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 min-h-0 overflow-hidden">
        {displayImages.length > 1 && (
          <button 
            onClick={handlePrev}
            className="absolute left-4 md:left-8 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-10"
          >
            <ChevronLeft size={32} />
          </button>
        )}
        
        <img 
          src={displayImages[currentIndex]} 
          alt={`Gallery image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-opacity duration-300"
          onClick={(e) => e.stopPropagation()} // Prevent click-outside closing when clicking the image itself
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%25" height="100%25" viewBox="0 0 800 600"%3E%3Crect fill="%23333333" width="800" height="600"/%3E%3Ctext fill="%23999999" font-family="sans-serif" font-size="30" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E';
          }}
        />

        {displayImages.length > 1 && (
          <button 
            onClick={handleNext}
            className="absolute right-4 md:right-8 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-10"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="h-24 shrink-0 px-4 pb-4">
          <div 
            className="h-full flex gap-2 justify-center max-w-3xl mx-auto overflow-x-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-20 h-full rounded-md overflow-hidden transition-all duration-200 ${
                  idx === currentIndex 
                    ? 'ring-2 ring-white opacity-100 scale-105' 
                    : 'opacity-40 hover:opacity-100'
                }`}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${idx + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100%25" height="100%25" viewBox="0 0 100 100"%3E%3Crect fill="%23333333" width="100" height="100"/%3E%3C/svg%3E';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGalleryModal;
