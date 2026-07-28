import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import PhotoGalleryModal from './PhotoGalleryModal';

const VenueImageMosaic = ({ images = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartIndex, setModalStartIndex] = useState(0);
  const displayImages = images.map(img => (typeof img === 'string' ? img : img.url));

  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[360px] bg-surface-variant flex items-center justify-center text-on-surface-variant font-body-lg rounded-2xl md:rounded-3xl">
        No Images Available
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const openModal = (index) => {
    setModalStartIndex(index);
    setIsModalOpen(true);
  };

  return (
    <>
      <PhotoGalleryModal 
        images={images} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialIndex={modalStartIndex} 
      />
      {/* Mobile view: Swipe/Button Carousel */}
      <div className="md:hidden relative w-full aspect-[4/3] overflow-hidden bg-black group rounded-2xl cursor-pointer" onClick={() => openModal(currentSlide)}>
        <img 
          src={displayImages[currentSlide]} 
          alt={`Venue ${currentSlide + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {displayImages.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-md text-dark hover:bg-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-md text-dark hover:bg-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {displayImages.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all ${idx === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Desktop view: 5-Panel Mosaic */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[360px] lg:h-[400px] w-full rounded-2xl overflow-hidden group relative">
        <div 
          className="col-span-2 row-span-2 relative h-full w-full bg-black overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => openModal(0)}
        >
          <img 
            src={displayImages[0]} 
            alt="Venue main" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
        {displayImages.slice(1, 5).map((img, idx) => (
          <div 
            key={idx} 
            className="relative h-full w-full bg-black overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => openModal(idx + 1)}
          >
            <img 
              src={img} 
              alt={`Venue detail ${idx + 2}`} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
        ))}
        {/* If less than 5 images, fill remaining slots with placeholders */}
        {Array.from({ length: Math.max(0, 4 - (displayImages.length - 1)) }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-full w-full bg-gray-100"></div>
        ))}
        
        {/* Show all photos button */}
        <button 
          onClick={() => openModal(0)}
          className="absolute bottom-4 right-4 bg-white px-4 py-1.5 rounded-lg border border-black text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Grid size={16} />
          Show all photos
        </button>
      </div>
    </>
  );
};

export default VenueImageMosaic;
